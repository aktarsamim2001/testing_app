"use client";

const CreatorFooter = () => {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} PartnerScale Creator Dashboard. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default CreatorFooter;
