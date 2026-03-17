class GenerateVariantsJob < ApplicationJob
  queue_as :default

  def perform(photo_id)
    photo = Photo.find_by(id: photo_id)
    return unless photo

    photo.images.each do |image|
      image.variant(resize_to_limit: [ 1200, 1200 ], format: :jpeg).processed
      image.variant(resize_to_fill: [ 400, 400 ], format: :jpeg).processed
    end
  end
end
