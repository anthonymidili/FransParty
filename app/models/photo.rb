class Photo < ApplicationRecord
  has_many_attached :images, dependent: :purge_later
  validates :images, presence: true
end
