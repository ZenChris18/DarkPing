import { useState, useRef, useEffect } from "react"
import { Tabs, Tab } from "@mui/material"

interface TabDef {
  key: string
  label: string
  content: React.ReactNode
}

interface ResultsTabsProps {
  tabs: TabDef[]
  initialTab?: number
  scrollOnTabChange?: boolean
}

export default function ResultsTabs({ tabs, initialTab = 0, scrollOnTabChange = true }: ResultsTabsProps) {
  const [tab, setTab] = useState(initialTab)
  const tabsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollOnTabChange && tabsRef.current) {
      tabsRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [tab, scrollOnTabChange])

  return (
    <div className="space-y-4" ref={tabsRef}>
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          backgroundColor: "transparent",
          borderRadius: 2,
          boxShadow: 1,
          minHeight: "48px",
          "& .MuiTab-root": { color: "#fff" },
          "& .Mui-selected": { color: "#ef4444 !important" },
          "& .MuiTabs-indicator": { backgroundColor: "#ef4444" }
        }}
      >
        {tabs.map((t) => (
          <Tab key={t.key} label={t.label} />
        ))}
      </Tabs>
      <div className="mt-4">{tabs[tab]?.content}</div>
    </div>
  )
}