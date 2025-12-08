"use client";

const BrandFooter = () => {
  return (
    <footer className="bg-card border-t border-border mt-auto w-full">
      <div className="w-full px-4 py-4 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} PartnerScale Brand Dashboard. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default BrandFooter;
