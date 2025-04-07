import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
    <main className="flex min-h-screenf justify-center flex-1">
      <h1 className="text-6xl font-bold">Quiz Generator</h1>
    </main>
    <footer className="footer pb-9 px-6 relative mb-0ff">
      <Button>Start the Quiz Generation</Button>
    </footer>
    </div>
  )
}
