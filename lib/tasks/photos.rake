namespace :photos do
  desc "Regenerate all Active Storage variants for every photo"
  task regenerate_variants: :environment do
    photos = Photo.with_attached_images.all
    puts "Regenerating variants for #{photos.count} photos..."

    photos.each do |photo|
      photo.images.each do |image|
        begin
          image.variant(resize_to_limit: [ 1200, 1200 ], format: :jpeg).processed
          image.variant(resize_to_fill: [ 400, 400 ], format: :jpeg).processed
          print "."
        rescue => e
          puts "\nFailed for image #{image.blob.filename}: #{e.message}"
        end
      end
    end

    puts "\nDone."
  end
end
