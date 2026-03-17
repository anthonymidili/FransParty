class SessionsController < ApplicationController
  def new
    redirect_to root_path if admin_signed_in?
  end

  def create
    password = params.dig(:session, :password) || params[:password]
    if password == ENV.fetch("ADMIN_PASSWORD", "")
      session[:admin] = true
      redirect_to root_path, notice: "Signed in as admin."
    else
      flash.now[:alert] = "Incorrect password."
      render :new, status: :unprocessable_entity
    end
  end

  def destroy
    session.delete(:admin)
    redirect_to root_path, notice: "Signed out."
  end
end
