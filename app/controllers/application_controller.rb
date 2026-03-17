class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  helper_method :admin_signed_in?

  private

  def admin_signed_in?
    session[:admin] == true
  end

  def require_admin
    unless admin_signed_in?
      redirect_to new_session_path, alert: "You must be an admin to do that."
    end
  end
end
