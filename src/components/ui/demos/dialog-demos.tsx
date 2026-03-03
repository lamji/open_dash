"use client";

import { useId } from "react";
import { ChevronLeftIcon, LogInIcon, UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

// ─── Shared Product Content ─────────────────────────────────

function ProductInfoContent() {
  return (
    <div className="[&_strong]:text-foreground space-y-4 [&_strong]:font-semibold">
      <div className="space-y-1">
        <p><strong>Product Name:</strong> SuperTech 2000</p>
        <p>The SuperTech 2000 is a high-performance device designed for tech enthusiasts and professionals alike.</p>
      </div>
      <div className="space-y-1">
        <p><strong>Specifications:</strong></p>
        <ul>
          <li>Processor: 3.6GHz Octa-Core</li>
          <li>Memory: 16GB RAM</li>
          <li>Storage: 1TB SSD</li>
          <li>Display: 15.6&rdquo; 4K UHD</li>
          <li>Battery Life: 12 hours</li>
        </ul>
      </div>
      <div className="space-y-1">
        <p><strong>Key Features:</strong></p>
        <ul>
          <li>Ultra-fast processing speed for intensive tasks</li>
          <li>Long battery life, perfect for on-the-go professionals</li>
          <li>Sleek and portable design</li>
          <li>Advanced cooling system</li>
        </ul>
      </div>
      <div className="space-y-1">
        <p><strong>Price:</strong></p>
        <p>$2,499.99 (Includes 1-year warranty)</p>
      </div>
      <div className="space-y-1">
        <p><strong>Customer Reviews:</strong></p>
        <p>&ldquo;Absolutely fantastic device! The performance is exceptional.&rdquo; - John D.</p>
        <p>&ldquo;Best purchase I&apos;ve made in years. Display quality is stunning.&rdquo; - Sarah L.</p>
      </div>
      <div className="space-y-1">
        <p><strong>Return Policy:</strong></p>
        <p>30-day return policy. Return the product within 30 days for a full refund.</p>
      </div>
      <div className="space-y-1">
        <p><strong>Warranty:</strong></p>
        <p>Standard 1-year warranty covering defects in materials and workmanship.</p>
      </div>
    </div>
  );
}

// ─── 1. Alert Dialog ────────────────────────────────────────

export const AlertDialogDemo = () => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" data-test-id="alert-dialog-trigger">
          Alert Dialog
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel data-test-id="alert-dialog-cancel">Cancel</AlertDialogCancel>
          <AlertDialogAction data-test-id="alert-dialog-action">Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// ─── 2. Alert Dialog with Icon ──────────────────────────────

export const AlertDialogWithIconDemo = () => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" data-test-id="alert-dialog-icon-trigger">
          Alert Dialog (With Icon)
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mb-4 flex size-9 items-center justify-center rounded-full bg-sky-600/10 sm:mx-0 dark:bg-sky-400/10">
            <UploadIcon className="size-4.5 text-sky-600 dark:text-sky-400" />
          </div>
          <AlertDialogTitle>New Update is Available</AlertDialogTitle>
          <AlertDialogDescription>
            New update is available for your application. Please update to the
            latest version to enjoy new features.
          </AlertDialogDescription>
          <ol className="text-muted-foreground mt-4 flex list-decimal flex-col gap-2 pl-6 text-sm">
            <li>New analytics widgets for daily/weekly metrics</li>
            <li>Simplified navigation menu</li>
            <li>Dark mode support</li>
            <li>Timeline: 6 weeks</li>
          </ol>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel data-test-id="alert-dialog-icon-cancel">Cancel</AlertDialogCancel>
          <AlertDialogAction
            data-test-id="alert-dialog-icon-action"
            className="bg-sky-600 text-white hover:bg-sky-600 focus-visible:ring-sky-600 dark:bg-sky-400 dark:hover:bg-sky-400 dark:focus-visible:ring-sky-400"
          >
            Update Now
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// ─── 3. Dialog Full Screen ──────────────────────────────────

export const DialogFullScreenDemo = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" data-test-id="dialog-fullscreen-trigger">
          Fullscreen Dialog
        </Button>
      </DialogTrigger>
      <DialogContent className="mb-8 flex h-[calc(100vh-2rem)] min-w-[calc(100vw-2rem)] flex-col justify-between gap-0 p-0">
        <ScrollArea className="flex flex-col justify-between overflow-hidden">
          <DialogHeader className="contents space-y-0 text-left">
            <DialogTitle className="px-6 pt-6">Product Information</DialogTitle>
            <DialogDescription asChild>
              <div className="p-6">
                <ProductInfoContent />
              </div>
            </DialogDescription>
          </DialogHeader>
        </ScrollArea>
        <DialogFooter className="px-6 pb-6 sm:justify-end">
          <DialogClose asChild>
            <Button variant="outline" data-test-id="dialog-fullscreen-back">
              <ChevronLeftIcon />
              Back
            </Button>
          </DialogClose>
          <Button type="button" data-test-id="dialog-fullscreen-more">
            Read More
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── 4. Dialog Rating ───────────────────────────────────────

export const DialogRatingDemo = () => {
  const id = useId();

  const ratings = [
    { value: "1", label: "Angry", icon: "😡" },
    { value: "2", label: "Sad", icon: "🙁" },
    { value: "3", label: "Neutral", icon: "🙂" },
    { value: "4", label: "Happy", icon: "😁" },
    { value: "5", label: "Laughing", icon: "🤩" },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" data-test-id="dialog-rating-trigger">
          Rating
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Help us improve our product for you
          </DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4 pt-4">
          <fieldset className="space-y-4">
            <legend className="text-foreground text-sm leading-none font-medium">
              How would you describe your experience?
            </legend>
            <RadioGroup className="flex gap-1.5" defaultValue="5">
              {ratings.map((rating) => (
                <label
                  key={`${id}-${rating.value}`}
                  className="border-input relative flex size-9 cursor-pointer flex-col items-center justify-center rounded-full border text-center text-xl shadow-xs transition-[color,box-shadow] outline-none has-data-[state=checked]:border-sky-600 has-data-[state=checked]:bg-sky-600/10 dark:has-data-[state=checked]:border-sky-400 dark:has-data-[state=checked]:bg-sky-400/10"
                >
                  <RadioGroupItem
                    id={`${id}-${rating.value}`}
                    value={rating.value}
                    className="sr-only after:absolute after:inset-0"
                    data-test-id={`dialog-rating-${rating.value}`}
                  />
                  {rating.icon}
                </label>
              ))}
            </RadioGroup>
          </fieldset>
          <div className="grid grow-1 gap-3">
            <Textarea
              placeholder="Type your message here."
              data-test-id="dialog-rating-textarea"
              required
            />
            <p className="text-muted-foreground text-sm">500/500 characters left</p>
          </div>
          <div className="flex gap-3">
            <Checkbox id={`${id}-terms`} data-test-id="dialog-rating-consent" />
            <Label htmlFor={`${id}-terms`}>
              I consent to being contacted based on my feedback
            </Label>
          </div>
          <DialogFooter className="sm:justify-end">
            <DialogClose asChild>
              <Button variant="outline" data-test-id="dialog-rating-cancel">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" data-test-id="dialog-rating-submit">
              Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ─── 5. Dialog Sign In ──────────────────────────────────────

export const DialogSignInDemo = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" data-test-id="dialog-signin-trigger">
          Sign In
        </Button>
      </DialogTrigger>
      <DialogContent className="to-card bg-gradient-to-b from-sky-100 to-40% [background-size:100%_101%] sm:max-w-sm dark:from-sky-900">
        <DialogHeader className="items-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-sky-600/10 sm:mx-0 dark:bg-sky-400/10">
            <LogInIcon className="size-6 text-sky-600 dark:text-sky-400" />
          </div>
          <DialogTitle>Sign in with email</DialogTitle>
          <DialogDescription className="text-center">
            Make a new doc to bring your words, data and teams together. For free.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="grid gap-3">
            <Label htmlFor="signin-email">Email</Label>
            <Input
              type="email"
              id="signin-email"
              placeholder="example@gmail.com"
              data-test-id="dialog-signin-email"
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="signin-password">Password</Label>
            <Input
              type="password"
              id="signin-password"
              placeholder="Password"
              data-test-id="dialog-signin-password"
            />
          </div>
        </div>
        <DialogFooter className="space-y-2 pt-4 sm:flex-col">
          <Button
            data-test-id="dialog-signin-submit"
            className="bg-sky-600 text-white hover:bg-sky-600 focus-visible:ring-sky-600 dark:bg-sky-400 dark:hover:bg-sky-400 dark:focus-visible:ring-sky-400"
          >
            Get Started
          </Button>
          <div className="before:bg-border after:bg-border flex items-center gap-4 before:h-px before:flex-1 after:h-px after:flex-1">
            <span className="text-muted-foreground text-xs">Or sign in with</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button variant="outline" className="flex-1" data-test-id="dialog-signin-google">
              Google
            </Button>
            <Button variant="outline" className="flex-1" data-test-id="dialog-signin-github">
              GitHub
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── 6. Dialog Sign Up ──────────────────────────────────────

export const DialogSignUpDemo = () => {
  const id = useId();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" data-test-id="dialog-signup-trigger">
          Sign Up
        </Button>
      </DialogTrigger>
      <DialogContent className="to-card bg-gradient-to-b from-green-100 to-40% [background-size:100%_101%] sm:max-w-sm dark:from-green-900">
        <DialogHeader className="items-center">
          <DialogTitle>Sign Up</DialogTitle>
          <DialogDescription>Start your 60-day free trial now.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-3">
              <Label htmlFor="signup-first">First Name</Label>
              <Input id="signup-first" placeholder="John" data-test-id="dialog-signup-first" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="signup-last">Last Name</Label>
              <Input id="signup-last" placeholder="Doe" data-test-id="dialog-signup-last" />
            </div>
          </div>
          <div className="grid gap-3">
            <Label htmlFor="signup-email">Email</Label>
            <Input
              type="email"
              id="signup-email"
              placeholder="example@gmail.com"
              data-test-id="dialog-signup-email"
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="signup-password">Password</Label>
            <Input
              type="password"
              id="signup-password"
              placeholder="Password"
              data-test-id="dialog-signup-password"
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id={`${id}-agree`}
              data-test-id="dialog-signup-agree"
              className="data-[state=checked]:border-green-600 data-[state=checked]:bg-green-600 dark:data-[state=checked]:border-green-400 dark:data-[state=checked]:bg-green-400"
              defaultChecked
            />
            <Label htmlFor={`${id}-agree`} className="gap-1">
              I agree with terms and privacy policy
            </Label>
          </div>
        </div>
        <DialogFooter className="pt-4 sm:flex-col">
          <Button
            data-test-id="dialog-signup-submit"
            className="bg-green-600 text-white hover:bg-green-600 focus-visible:ring-green-600 dark:bg-green-400 dark:hover:bg-green-400 dark:focus-visible:ring-green-400"
          >
            Start your trial
          </Button>
          <div className="before:bg-border after:bg-border flex items-center gap-4 before:h-px before:flex-1 after:h-px after:flex-1">
            <span className="text-muted-foreground text-xs">Or</span>
          </div>
          <Button variant="outline" data-test-id="dialog-signup-google">
            Continue with Google
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── 7. Dialog Sticky Footer ────────────────────────────────

export const DialogStickyFooterDemo = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" data-test-id="dialog-sticky-footer-trigger">
          Sticky Footer Dialog
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[min(600px,80vh)] flex-col gap-0 p-0 sm:max-w-md">
        <DialogHeader className="contents space-y-0 text-left">
          <ScrollArea className="flex max-h-full flex-col overflow-hidden">
            <DialogTitle className="px-6 pt-6">Product Information</DialogTitle>
            <DialogDescription asChild>
              <div className="p-6">
                <ProductInfoContent />
              </div>
            </DialogDescription>
          </ScrollArea>
        </DialogHeader>
        <DialogFooter className="flex-row items-center justify-end border-t px-6 py-4">
          <DialogClose asChild>
            <Button variant="outline" data-test-id="dialog-sticky-footer-back">
              <ChevronLeftIcon />
              Back
            </Button>
          </DialogClose>
          <Button type="button" data-test-id="dialog-sticky-footer-more">
            Read More
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── 8. Dialog Sticky Header ────────────────────────────────

export const DialogStickyHeaderDemo = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" data-test-id="dialog-sticky-header-trigger">
          Sticky Header Dialog
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[min(600px,80vh)] flex-col gap-0 p-0 sm:max-w-md">
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="border-b px-6 py-4">Product Information</DialogTitle>
          <ScrollArea className="flex max-h-full flex-col overflow-hidden">
            <DialogDescription asChild>
              <div className="p-6">
                <ProductInfoContent />
              </div>
            </DialogDescription>
            <DialogFooter className="px-6 pb-6 sm:justify-end">
              <DialogClose asChild>
                <Button variant="outline" data-test-id="dialog-sticky-header-back">
                  <ChevronLeftIcon />
                  Back
                </Button>
              </DialogClose>
              <Button type="button" data-test-id="dialog-sticky-header-more">
                Read More
              </Button>
            </DialogFooter>
          </ScrollArea>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

// ─── 9. Dialog Subscribe ────────────────────────────────────

export const DialogSubscribeDemo = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" data-test-id="dialog-subscribe-trigger">
          Subscribe
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl">
            Subscribe blog for latest updates
          </DialogTitle>
          <DialogDescription className="text-base">
            Subscribe to our blog to stay updated with the latest posts and news.
          </DialogDescription>
        </DialogHeader>
        <form className="flex gap-4">
          <div className="grid grow-1 gap-3">
            <Label htmlFor="subscribe-email">Email</Label>
            <Input
              type="email"
              id="subscribe-email"
              placeholder="example@gmail.com"
              data-test-id="dialog-subscribe-email"
              required
            />
          </div>
          <Button type="submit" className="self-end" data-test-id="dialog-subscribe-submit">
            Subscribe
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
