class PhotosController < ApplicationController
  def index
    @photos = Photo.with_attached_images.order(created_at: :desc)
  end

  def new
    @photo = Photo.new
  end

  def create
    @photo = Photo.new(photo_params)
    if @photo.save
      GenerateVariantsJob.perform_later(@photo.id)
      redirect_to photos_path, notice: "Photos uploaded successfully!"
    else
      render :new, status: :unprocessable_entity
    end
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
