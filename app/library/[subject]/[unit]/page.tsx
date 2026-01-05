"use client"

import { motion } from "framer-motion"
import { ArrowLeft, BookOpen, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const topicData = {
  discrete: {
    unitName: "Discrete Mathematics",
    topics: [
      {
        id: "recursive-proofs",
        title: "Recursive Proofs & Induction",
        desc: "Mastering the base case and inductive step for complex sequences.",
      },
      {
        id: "graph-theory",
        title: "Graph Theory Fundamentals",
        desc: "Nodes, edges, and pathfinding algorithms in discrete structures.",
      },
      {
        id: "combinatorics",
        title: "Permutations & Combinations",
        desc: "Strategic counting and probability in discrete finite sets.",
      },
    ],
  },
}

export default function UnitPage() {
  const params = useParams()
  const unitId = params.unit as string
  const unit = topicData[unitId as keyof typeof topicData] || {
    unitName: "Advanced Algorithms",
    topics: [
      { id: "1", title: "Time Complexity", desc: "Big O notation and efficiency analysis." },
      { id: "2", title: "Dynamic Programming", desc: "Breaking down complex problems into subproblems." },
    ],
  }

  return (
    <div className="space-y-8 pb-12">
      <Link href="/library">
        <Button variant="ghost" size="sm" className="gap-2 mb-4 hover:bg-transparent -ml-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Library
        </Button>
      </Link>

      <header>
        <h1 className="text-4xl font-bold tracking-tight mb-2">{unit.unitName}</h1>
        <p className="text-muted-foreground text-lg">Pick a topic to dive into simple explanations and resources.</p>
      </header>

      <div className="grid gap-4 max-w-4xl">
        {unit.topics.map((topic, idx) => (
          <Link key={topic.id} href={`/library/${params.subject}/${unitId}/${topic.id}`}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="group hover:border-primary/30 transition-all border-none shadow-sm">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-1 group-hover:text-primary transition-colors">
                        {topic.title}
                      </h3>
                      <p className="text-muted-foreground max-w-xl">{topic.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardContent>
              </Card>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  )
}
