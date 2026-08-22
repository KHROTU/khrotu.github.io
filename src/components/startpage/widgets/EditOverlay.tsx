type ReactNode = React.ReactNode;
export default function EditOverlay({ children }: { children: ReactNode }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 bg-[#040404]/90 border-t border-white/15 p-2 backdrop-blur-sm">
      {children}
    </div>
  );
}