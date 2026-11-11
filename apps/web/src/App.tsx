import { useState } from "react"
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning"

export default function App() {
  const [isStreaming, setIsStreaming] = useState(false)
  const [duration, setDuration] = useState<number | undefined>(5)

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div>
            <h1 className="text-lg font-semibold">
              แอปแชท นิยาย (React + shadcn/ui Trace)
            </h1>
            <p className="text-sm text-neutral-400">
              ตัวอย่างการทำงานของคอมโพเนนต์ Reasoning ที่ใช้ shadcn/ui Trace
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (!isStreaming) {
                setDuration(undefined)
                setIsStreaming(true)
              } else {
                setIsStreaming(false)
              }
            }}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500"
          >
            {isStreaming ? "หยุดสตรีม (Stop)" : "จำลองกำลังคิด (Stream)"}
          </button>
        </header>

        <section className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4">
          <Reasoning isStreaming={isStreaming} duration={duration}>
            <ReasoningTrigger />
            <ReasoningContent>
              {`วิเคราะห์บริบทของตัวละคร **เร็น** ในฉากเมืองเก่าไซออน:\n\n1. เชื่อมโยงปมเรื่อง *แกนผลึกดารา* กับผู้พิทักษ์แห่งหอคอยดวงดาว\n2. กำหนดบรรยากาศสายฝนและแสงเรืองรองสีฟ้าครามเพื่อขับเน้นอารมณ์ตึงเครียด`}
            </ReasoningContent>
          </Reasoning>

          <div className="text-sm leading-relaxed text-neutral-200">
            สายฝนในยามค่ำคืนกระหน่ำเทลงมาบนถนนคอนกรีตที่แตกระแหงของเขตเมืองเก่า
            เร็นกระชับเสื้อโค้ตตัวเก่าให้แนบแน่นขึ้นในขณะที่แสงสีฟ้าครามจากแกนผลึกดาราเต้นเป็นจังหวะ...
          </div>
        </section>
      </div>
    </div>
  )
}
