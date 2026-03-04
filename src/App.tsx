import { Button } from "@/components/ui/button"

function App() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        <header className="text-center py-8">
          <h1 className="text-3xl font-bold text-gray-900">
            ReceiptSplit
          </h1>
          <p className="text-gray-600 mt-2">
            Fast, frictionless receipt splitting
          </p>
        </header>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4">Component Test</h2>

          {/* Test shadcn/ui Button */}
          <div className="space-y-2">
            <Button className="w-full">Default Button</Button>
            <Button variant="outline" className="w-full">Outline Button</Button>
          </div>

          {/* Test Person A/B colors */}
          <div className="space-y-2 pt-4 border-t">
            <div className="p-4 bg-person-a-light border-2 border-person-a rounded">
              <span className="text-person-a-dark font-semibold">Person A (Blue)</span>
            </div>
            <div className="p-4 bg-person-b-light border-2 border-person-b rounded">
              <span className="text-person-b-dark font-semibold">Person B (Green)</span>
            </div>
          </div>
        </div>

        <footer className="text-center text-sm text-gray-500 pt-4">
          Foundation setup complete
        </footer>
      </div>
    </div>
  )
}

export default App
