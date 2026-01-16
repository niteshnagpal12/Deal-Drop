"use client";
import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { AuthModal } from "./AuthModal";
import { addProdcut } from "@/app/action";
import { toast } from "sonner";
import { CircleAlert, Loader2 } from "lucide-react";
import { Dialog, DialogHeader, DialogTitle, DialogContent } from "./ui/dialog";

const AddProductForm = ({ user, urls }) => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    // checking if the url is already added
    if (urls.includes(url)) {
      toast.info("Product already added!", { duration: 3000 });
      setUrl("");
      return;
    }

    setLoading(true);

    // creating a form data to send to the server action
    const formData = new FormData();
    formData.append("url", url);

    const result = await addProdcut(formData);

    // checking if the result has error or success
    if (result.error) {
      console.log("error", result.error);
      // toast.error(result.error, { duration: 5000 });
      setShowErrorModal(true);
      setUrl("");
    } else {
      toast.success("Product added successfully!");
      setUrl("");
    }

    setLoading(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter product URL (Amazon, flipkart, etc.)"
            className="h-12 text-base"
            required
            disabled={loading}
          />

          <Button
            className="bg-orange-500 hover:bg-orange-600 h-10 sm:h-12 px-8"
            type="submit"
            disabled={loading}
            size={"lg"}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Track Price"
            )}
          </Button>
        </div>
      </form>
      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
      {/* Scrapping Error Modal */}
      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-1 text-orange-600">
              <CircleAlert size={15} />
              Product Tracking Unavailable
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Due to website restrictions, this product cannot be tracked right
            now, please try a different product or try again later.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddProductForm;
