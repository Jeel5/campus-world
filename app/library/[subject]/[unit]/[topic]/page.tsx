"use client"

import { Input } from "@/components/ui/input"
import { ArrowLeft, FileText, Youtube, MessageCircle, Sparkles, Download, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function TopicPage() {
  const params = useParams()

  return (
    <div className="space-y-8 pb-20">
      <Link href={`/library/${params.subject}/${params.unit}`}>
        <Button variant="ghost" size="sm" className="gap-2 mb-4 hover:bg-transparent -ml-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Unit
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <header>
            <h1 className="text-4xl font-bold tracking-tight mb-4">Recursive Proofs & Induction</h1>
            <div className="flex items-center gap-3">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none">Computer Science</Badge>
              <Badge variant="outline">Unit: Discrete Math</Badge>
            </div>
          </header>

          <Card className="border-none shadow-sm bg-primary/5">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">AI-Generated Simple Explanation</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p className="text-lg leading-relaxed text-slate-700">
                Think of **Mathematical Induction** like falling dominoes. To prove something is true for all numbers:
              </p>
              <ul className="space-y-4 my-6">
                <li className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-primary shrink-0 shadow-sm">
                    1
                  </div>
                  <div>
                    <span className="font-bold">The Base Case:</span> Prove it works for the first domino ($$n=1$$). If
                    the first one doesn't fall, nothing else matters.
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-primary shrink-0 shadow-sm">
                    2
                  </div>
                  <div>
                    <span className="font-bold">The Inductive Step:</span> Show that **if** any domino ($$k$$) falls, it
                    **must** knock over the next domino ($$k+1$$).
                  </div>
                </li>
              </ul>
              <p className="text-slate-600 italic">
                By proving these two steps, you've proved it for every domino in the infinite line!
              </p>
            </CardContent>
          </Card>

          <section className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-muted-foreground" />
              Resource Materials
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Lecture_Notes_Week_{i}.pdf</p>
                        <p className="text-xs text-muted-foreground">Uploaded by Prof. Miller</p>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Youtube className="w-5 h-5 text-red-500" />
              Curated Video Links
            </h3>
            <div className="space-y-3">
              {["Induction Explained in 5 Mins", "The Logic of Recursion"].map((title) => (
                <div
                  key={title}
                  className="flex items-center justify-between p-4 rounded-xl border-none bg-card shadow-sm hover:bg-muted/50 transition-colors cursor-pointer group"
                >
                  <span className="font-medium">{title}</span>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-lg h-[600px] flex flex-col">
            <CardHeader className="border-b pb-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Topic Discussion</CardTitle>
              </div>
              <CardDescription>Questions and insights specific to this topic.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-0 flex flex-col">
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] uppercase font-bold px-1 py-0 h-4">
                        2nd Year
                      </Badge>
                      <span className="text-xs text-muted-foreground font-medium">Anonymous</span>
                    </div>
                    <p className="text-sm bg-muted p-3 rounded-2xl rounded-tl-none">
                      Is the base case always n=1? What if the problem starts at n=0?
                    </p>
                  </div>
                  <div className="space-y-2 pl-6 border-l-2 border-primary/20">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary/10 text-primary text-[10px] uppercase font-bold px-1 py-0 h-4 border-none">
                        Top Voice
                      </Badge>
                      <span className="text-xs text-muted-foreground font-medium">Senior CS</span>
                    </div>
                    <p className="text-sm bg-primary/5 p-3 rounded-2xl rounded-tl-none border border-primary/10">
                      Great question! The base case is just the smallest value for which the statement is true. It can
                      definitely be n=0, or even n=5. Check your domain!
                    </p>
                  </div>
                </div>
              </ScrollArea>
              <div className="p-4 border-t bg-muted/30">
                <div className="relative">
                  <Input placeholder="Add to the discussion..." className="pr-12 bg-white border-none shadow-sm" />
                  <Button size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg">
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
