"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import { CircleUser, LogIn, LogOutIcon } from "lucide-react";
import { AuthModal } from "./AuthModal";
import { signOut } from "@/app/action";

const AuthButton = ({ user }) => {
  // console.log("AuthButton user:", user);
  // local state for showing modal
  const [showAuthModal, setShowAuthModal] = useState(false);

  // fetching the user name from the email
  const userName = user?.email.split("@")[0];

  if (user) {
    return (
      <div className="flex ">
        <div className="flex gap-2 items-center">
          {" "}
          <CircleUser size={16} /> Hi {userName}
        </div>

        <form action={signOut}>
          <Button
            variant="ghost"
            size="sm"
            type="submit"
            className="gap-2 hover"
          >
            <LogOutIcon size={15} />
          </Button>
        </form>
      </div>
    );
  }

  return (
    <>
      {" "}
      <Button
        onClick={() => setShowAuthModal(true)}
        variant="default"
        size="sm"
        className="bg-orange-500 hover:bg-orange-600 gap-2"
      >
        <LogIn className="w-4 h-4" />
        Sign in
      </Button>
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
};

export default AuthButton;
