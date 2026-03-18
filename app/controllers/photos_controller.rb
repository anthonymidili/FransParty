class PhotosController < ApplicationController
  before_action :require_admin, only: [ :destroy, :purge_image ]

  PER_PAGE = 12

  def index
    @page = (params[:page] || 1).to_i
    base = ActiveStorage::Attachment.where(record_type: "Photo", name: "images")
    @images = base.includes(:record, blob: :variant_records)
                  .order(created_at: :desc)
                  .offset((@page - 1) * PER_PAGE)
                  .limit(PER_PAGE)
    @has_more = base.offset(@page * PER_PAGE).exists?

    respond_to do |format|
      format.html
      format.turbo_stream if params[:page].present?
    end
  end

  def new
    @photo = Photo.new
  end

  def create
    @photo = Photo.new(photo_params)
    if @photo.save
      begin
        GenerateVariantsJob.perform_later(@photo.id)
      rescue => e
        Rails.logger.error "Failed to enqueue GenerateVariantsJob: #{e.message}"
      end
      redirect_to photos_path, notice: "Photos uploaded successfully!"
    else
      render :new, status: :unprocessable_entity
    end
  end

  def purge_image
    @photo = Photo.find(params[:id])
    image = @photo.images.find { |img| img.blob.signed_id == params[:signed_id] }
    image&.purge_later
    @photo.destroy if @photo.reload.images.none?
    redirect_to photos_path, notice: "Photo deleted."
  end

  def destroy
    @photo = Photo.find(params[:id])
    @photo.destroy
    redirect_to photos_path, notice: "Photo deleted."
  end

  private

  def photo_params
    params.require(:photo).permit(:caption, images: [])
  end
end
