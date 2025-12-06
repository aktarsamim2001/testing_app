"use client";

const AdminFooter = () => {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} PartnerScale Admin. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default AdminFooter;
