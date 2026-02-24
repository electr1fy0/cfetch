export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 flex-col gap-4 p-4">
        {children}
      </div>
    </div>
  )
}
