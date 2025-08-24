"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  UserCircle,
  Menu,
  Search,
  Download,
  FileText,
  BarChart2,
  PhoneCall,
  Loader2,
  CircleUser,
} from "lucide-react";
import { CallRecord } from "./types";
import ReactMarkdown from "react-markdown";
import api from "@/services/api";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/global/Navbar";

function convertNanosecondTimestamps(startedAtNs: bigint, endedAtNs: bigint) {
  const startedAtMs = Number(startedAtNs) / 1_000_000;
  const endedAtMs = Number(endedAtNs) / 1_000_000;
  const startedDate = new Date(startedAtMs);
  const endedDate = new Date(endedAtMs);
  const durationMs = endedAtMs - startedAtMs;
  const totalSeconds = durationMs / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const durationFormatted = `${minutes}m ${seconds}s`;
  return {
    startedAt: startedDate.toISOString(),
    endedAt: endedDate.toISOString(),
    durationSeconds: (durationMs / 1000).toFixed(6),
    durationFormatted,
  };
}

function formatTimestamp(timestampIso: string): string {
  const dateObj = new Date(timestampIso);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };
  return dateObj.toLocaleString("en-US", options);
}

export default function PostCallAnalysisPage() {
  const [callData, setCallData] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [transcriptionDialogOpen, setTranscriptionDialogOpen] =
    useState<boolean>(false);
  const [analysisDialogOpen, setAnalysisDialogOpen] = useState<boolean>(false);
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);

  const [transcriptionLoadingId, setTranscriptionLoadingId] = useState<
    string | null
  >(null);
  const [analysisLoadingId, setAnalysisLoadingId] = useState<string | null>(
    null
  );
  const [transcriptionModalLoading, setTranscriptionModalLoading] =
    useState(false);
  const [analysisModalLoading, setAnalysisModalLoading] = useState(false);

  useEffect(() => {
    const fetchCalls = async () => {
      try {
        const { data } = await api.get("/calls/all");
        setCallData(data);
        setLoading(false);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
        setLoading(false);
      }
    };

    fetchCalls();
  }, []);

  const handleDownloadRecording = (call: CallRecord): void => {
    if (call.segments && call.segments.length > 0) {
      const link = document.createElement("a");
      link.href = call.segments[0];
      link.download = `call-recording-${call.egress_id}.ts`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShowTranscription = async (call: CallRecord): Promise<void> => {
    setTranscriptionLoadingId(call._id);
    setTranscriptionModalLoading(true);
    if (!call.transcription || !call.translated) {
      try {
        const { data } = await api.get(`/calls/transcription/${call.egress_id}`);
        call.transcription = data.transcription;
        call.translated = data.translated;
      } catch (err) {
        console.error("Error fetching call transcription:", err);
      }
    }
    setSelectedCall({ ...call }); // force re-render
    setTranscriptionDialogOpen(true);
    setTranscriptionLoadingId(null);
    setTranscriptionModalLoading(false);
  };

  const handleShowAnalysis = async (call: CallRecord): Promise<void> => {
    setAnalysisLoadingId(call._id);
    setAnalysisModalLoading(true);
    if (!call.analysis) {
      try {
        const { data } = await api.get(`/calls/analysis/${call.egress_id}`);
        call.analysis = data;
      } catch (err) {
        console.error("Error fetching call analysis:", err);
      }
    }
    setSelectedCall({ ...call }); // force re-render
    setAnalysisDialogOpen(true);
    setAnalysisLoadingId(null);
    setAnalysisModalLoading(false);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
     <Navbar />

      <main className="flex flex-col flex-1 gap-4 p-4 overflow-hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Post Call Analysis
          </h1>
          <p className="text-muted-foreground">
            Review and analyze call recordings, transcriptions and AI-generated
            insights.
          </p>
        </div>

        <Card className="flex flex-col flex-1 overflow-hidden">
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Call Records</CardTitle>
                <CardDescription className="text-sm">
                  Access call recordings, transcripts and analysis for all
                  calls.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-0">
            {loading ? (
              <div className="flex flex-col gap-2 h-32 justify-center px-4">
                <Skeleton className="h-6 w-1/3 mb-2" />
                <Skeleton className="h-10 w-full mb-2" />
                <Skeleton className="h-10 w-full mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : error ? (
              <div className="flex justify-center items-center h-32">
                <p className="text-red-500">Error: {error}</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead className="w-[120px]">Call ID</TableHead>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className="w-[140px]">Start Time</TableHead>
                    <TableHead className="w-[140px]">End Time</TableHead>
                    <TableHead className="w-[100px]">Duration</TableHead>
                    <TableHead className="w-[300px] text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {callData.map((call) => {
                    const { startedAt, endedAt, durationFormatted } =
                      convertNanosecondTimestamps(
                        BigInt(call.started_at),
                        BigInt(call.ended_at)
                      );
                    return (
                      <TableRow key={call._id}>
                        <TableCell className="font-medium">
                          {call.egress_id}
                        </TableCell>
                        <TableCell>{call.cust_name}</TableCell>
                        <TableCell>{call.phone_number}</TableCell>
                        <TableCell>
                          {call.product_name ? (
                            <Badge variant="outline">{call.product_name}</Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              N/A
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{formatTimestamp(startedAt)}</TableCell>
                        <TableCell>{formatTimestamp(endedAt)}</TableCell>
                        <TableCell>{durationFormatted}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadRecording(call)}
                              disabled={
                                !call.segments || call.segments.length === 0
                              }
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleShowTranscription(call)}
                              disabled={transcriptionLoadingId === call._id}
                            >
                              {transcriptionLoadingId === call._id ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <FileText className="h-4 w-4 mr-1" />
                              )}
                              Transcription
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleShowAnalysis(call)}
                              disabled={analysisLoadingId === call._id}
                            >
                              {analysisLoadingId === call._id ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <BarChart2 className="h-4 w-4 mr-1" />
                              )}
                              Analysis
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
      <Dialog
        open={transcriptionDialogOpen}
        onOpenChange={setTranscriptionDialogOpen}
      >
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Call Transcription</DialogTitle>
            <DialogDescription>
              {selectedCall &&
                `Call ID: ${selectedCall.egress_id} - ${selectedCall.cust_name}`}
              {selectedCall?.product_name && ` - ${selectedCall.product_name}`}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            {transcriptionModalLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading transcription...</span>
              </div>
            ) : selectedCall &&
              (selectedCall.transcription || selectedCall.translated) ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold border-b pb-1">
                    Original Transcript
                  </h3>
                  <ReactMarkdown className="prose max-w-none">
                    {selectedCall.transcription || "No transcription available"}
                  </ReactMarkdown>
                </div>
                <div className="space-y-2 pt-2 border-t">
                  <h3 className="text-lg font-semibold border-b pb-1">
                    Translated Transcript
                  </h3>
                  <ReactMarkdown className="prose max-w-none">
                    {selectedCall.translated && selectedCall.translated !== ""
                      ? selectedCall.translated
                      : "Translation not available"}
                  </ReactMarkdown>
                </div>
              </div>
            ) : selectedCall ? (
              <>
                <div className="bg-muted/50 p-3 rounded-md">
                  <p className="text-sm font-medium mb-1">Agent</p>
                  <p className="text-sm">
                    Hello, this is John from Ring Bank. Am I speaking with{" "}
                    {selectedCall.cust_name}?
                  </p>
                </div>
                <div className="bg-primary/10 p-3 rounded-md">
                  <p className="text-sm font-medium mb-1">Customer</p>
                  <p className="text-sm">
                    Yes, that&apos;s me. How can I help you?
                  </p>
                </div>
                <div className="bg-muted/50 p-3 rounded-md">
                  <p className="text-sm font-medium mb-1">Agent</p>
                  <p className="text-sm">
                    I&apos;m calling to discuss{" "}
                    {selectedCall.product_name
                      ? `our ${selectedCall.product_name} offering`
                      : "your banking needs"}{" "}
                    and see if we can help you with any of our services. Do you
                    have a few minutes to talk?
                  </p>
                </div>
                <div className="bg-primary/10 p-3 rounded-md">
                  <p className="text-sm font-medium mb-1">Customer</p>
                  <p className="text-sm">
                    Sure, I can spare a few minutes. What services are you
                    offering?
                  </p>
                </div>
              </>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      {/* Analysis Dialog */}
      <Dialog open={analysisDialogOpen} onOpenChange={setAnalysisDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Call Analysis</DialogTitle>
            <DialogDescription>
              {selectedCall &&
                `AI-generated insights for call with ${selectedCall.cust_name}`}
              {selectedCall?.product_name &&
                ` regarding ${selectedCall.product_name}`}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            {analysisModalLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading analysis...</span>
              </div>
            ) : selectedCall && selectedCall.analysis ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Call Summary</h3>
                  <p className="text-sm">{selectedCall.analysis.summary}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2">
                    Customer Sentiment
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div
                        className="bg-green-500 h-2.5 rounded-full"
                        style={{
                          width: `${
                            selectedCall.analysis.sentiment.positive || 0
                          }%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm">
                      {selectedCall.analysis.sentiment.positive}%{" "}
                      {selectedCall.analysis.sentiment.description}
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2">
                    Key Topics Discussed
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCall.analysis.keyTopics.map((topic, index) => (
                      <Badge key={index}>{topic}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2">
                    Customer Pain Points
                  </h3>
                  {selectedCall.analysis.painPoints.length ? (
                    <ul className="space-y-1">
                      {selectedCall.analysis.painPoints.map((point, index) => (
                        <li key={index} className="text-sm">
                          • {point}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm">No pain points reported</p>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2">
                    Agent Performance
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Clarity of Explanation
                      </p>
                      <div className="flex items-center">
                        <div className="w-full bg-muted rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                              width: `${
                                (selectedCall.analysis.agentPerformance
                                  .clarity || 0) * 10
                              }%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm">
                          {selectedCall.analysis.agentPerformance.clarity}/10
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Objection Handling
                      </p>
                      <div className="flex items-center">
                        <div className="w-full bg-muted rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                              width: `${
                                (selectedCall.analysis.agentPerformance
                                  .objectionHandling || 0) * 10
                              }%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm">
                          {
                            selectedCall.analysis.agentPerformance
                              .objectionHandling
                          }
                          /10
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2">
                    Next Steps & Recommendations
                  </h3>
                  <ul className="space-y-1">
                    {selectedCall.analysis.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm">
                        • {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-sm">No analysis available.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
