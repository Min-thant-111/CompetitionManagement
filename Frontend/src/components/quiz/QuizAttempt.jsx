import { useState, useEffect, useCallback } from "react";
import { 
  Clock, AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, 
  X, Send, Flag, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function QuizAttempt({ 
  quiz, 
  onSubmit, 
  onCancel, 
  submittedAnswers = null, // If provided, it's view-only mode
  isViewMode = false 
}) {
  const [answers, setAnswers] = useState(() => {
    if (submittedAnswers) {
      return submittedAnswers;
    }
    const initial = {};
    quiz.questions.forEach(q => {
      initial[q.id] = "";
    });
    return initial;
  });
  
  const [currentPage, setCurrentPage] = useState(0);
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [timeRemaining, setTimeRemaining] = useState(() => {
    // Parse time limit (e.g., "60 minutes" -> 3600 seconds)
    const match = quiz.timeLimit.match(/(\d+)/);
    return match ? parseInt(match[1]) * 60 : 3600;
  });
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questionsPerPage = 10;
  const totalPages = Math.ceil(quiz.questions.length / questionsPerPage);
  const currentQuestions = quiz.questions.slice(
    currentPage * questionsPerPage,
    (currentPage + 1) * questionsPerPage
  );

  // Prevent page navigation during quiz
  useEffect(() => {
    if (isViewMode) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "You have an ongoing quiz. Are you sure you want to leave?";
      return e.returnValue;
    };

    const handlePopState = (e) => {
      e.preventDefault();
      window.history.pushState(null, "", window.location.href);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);
    window.history.pushState(null, "", window.location.href);

    // Enter fullscreen
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
      if (document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, [isViewMode]);

  // Timer countdown
  useEffect(() => {
    if (isViewMode || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Auto-submit when time is over
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isViewMode, timeRemaining]);

  const handleAutoSubmit = useCallback(() => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    onSubmit(answers);
  }, [answers, onSubmit, isSubmitting]);

  const handleAnswerChange = (questionId, answer) => {
    if (isViewMode) return;
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const toggleFlag = (questionId) => {
    if (isViewMode) return;
    setFlaggedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getAnsweredCount = () => {
    return Object.values(answers).filter(a => a !== "").length;
  };

  const isQuestionAnswered = (questionId) => {
    return answers[questionId] !== "";
  };

  const goToQuestion = (questionIndex) => {
    const page = Math.floor(questionIndex / questionsPerPage);
    setCurrentPage(page);
  };

  const handleSubmit = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    onSubmit(answers);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="font-display font-bold text-xl">{quiz.title}</h1>
          {isViewMode && (
            <span className="badge-status bg-info/10 text-info flex items-center gap-1">
              <Eye className="w-3 h-3" />
              View Only
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {!isViewMode && (
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-bold",
              timeRemaining < 300 ? "bg-destructive/10 text-destructive animate-pulse" : "bg-muted text-foreground"
            )}>
              <Clock className="w-5 h-5" />
              {formatTime(timeRemaining)}
            </div>
          )}
          
          {isViewMode && (
            <Button variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Question Navigation Sidebar */}
        <div className="w-64 bg-card border-r border-border p-4 flex flex-col">
          <div className="mb-4">
            <h3 className="font-semibold text-sm text-muted-foreground mb-2">Questions</h3>
            <p className="text-xs text-muted-foreground">
              {getAnsweredCount()} / {quiz.questions.length} answered
            </p>
          </div>
          
          {/* Question Number Grid */}
          <div className="flex-1 overflow-y-auto pr-1">
            <div className="grid grid-cols-5 gap-1.5">
              {quiz.questions.map((question, index) => {
                const isAnswered = isQuestionAnswered(question.id);
                const isFlagged = flaggedQuestions.has(question.id);
                const isOnCurrentPage = Math.floor(index / questionsPerPage) === currentPage;
                const questionOnPage = index - (currentPage * questionsPerPage);
                const isCurrentQuestion = isOnCurrentPage && questionOnPage >= 0 && questionOnPage < currentQuestions.length;
                
                return (
                  <button
                    key={question.id}
                    onClick={() => goToQuestion(index)}
                    title={`Go to Question ${index + 1}`}
                    className={cn(
                      "w-9 h-9 rounded-md text-xs font-semibold transition-all relative flex items-center justify-center border",
                      isAnswered 
                        ? "bg-success text-success-foreground border-success/50 shadow-sm" 
                        : "bg-muted/30 text-muted-foreground border-border hover:bg-muted hover:border-secondary/50",
                      isOnCurrentPage && "ring-2 ring-secondary ring-offset-1 ring-offset-background",
                      isFlagged && !isAnswered && "border-warning border-2"
                    )}
                  >
                    {index + 1}
                    {isFlagged && (
                      <Flag className="w-2.5 h-2.5 absolute -top-0.5 -right-0.5 text-warning fill-warning" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 pt-4 border-t border-border space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-success border border-success/50" />
              <span className="text-muted-foreground">Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-muted/30 border border-border" />
              <span className="text-muted-foreground">Not Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-muted/30 border-2 border-warning" />
              <span className="text-muted-foreground">Flagged</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-muted/30 border border-border ring-2 ring-secondary ring-offset-1" />
              <span className="text-muted-foreground">Current Page</span>
            </div>
          </div>
        </div>

        {/* Questions Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {currentQuestions.map((question, pageIndex) => {
              const globalIndex = currentPage * questionsPerPage + pageIndex;
              const isFlagged = flaggedQuestions.has(question.id);
              
              return (
                <div 
                  key={question.id}
                  className={cn(
                    "p-6 rounded-xl border bg-card",
                    isFlagged ? "border-warning" : "border-border"
                  )}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <span className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0",
                        isQuestionAnswered(question.id)
                          ? "bg-success text-success-foreground"
                          : "bg-secondary text-secondary-foreground"
                      )}>
                        {globalIndex + 1}
                      </span>
                      <div>
                        <span className={cn(
                          "badge-status text-xs mb-2 inline-block",
                          question.type === "mcq" ? "bg-secondary/10 text-secondary" :
                          question.type === "truefalse" ? "bg-info/10 text-info" :
                          "bg-warning/10 text-warning"
                        )}>
                          {question.type === "mcq" ? "Multiple Choice" : 
                           question.type === "truefalse" ? "True/False" : "Fill in the Blank"}
                        </span>
                        <p className="font-medium text-foreground text-lg">{question.question}</p>
                      </div>
                    </div>
                    {!isViewMode && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => toggleFlag(question.id)}
                        className={cn(isFlagged && "text-warning")}
                      >
                        <Flag className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {/* MCQ Options */}
                  {question.type === "mcq" && question.options && (
                    <div className="ml-11 space-y-2">
                      {question.options.map((option, optIndex) => (
                        <label 
                          key={optIndex}
                          className={cn(
                            "flex items-center gap-3 p-4 rounded-lg transition-colors border",
                            isViewMode ? "cursor-default" : "cursor-pointer",
                            answers[question.id] === option 
                              ? "bg-secondary/10 border-secondary" 
                              : "bg-muted/30 border-border hover:bg-muted/50"
                          )}
                        >
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={option}
                            checked={answers[question.id] === option}
                            onChange={() => handleAnswerChange(question.id, option)}
                            disabled={isViewMode}
                            className="sr-only"
                          />
                          <div className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                            answers[question.id] === option 
                              ? "border-secondary bg-secondary" 
                              : "border-muted-foreground"
                          )}>
                            {answers[question.id] === option && (
                              <div className="w-2 h-2 rounded-full bg-secondary-foreground" />
                            )}
                          </div>
                          <span className="text-foreground">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* True/False Options */}
                  {question.type === "truefalse" && question.options && (
                    <div className="ml-11 flex gap-4">
                      {question.options.map((option, optIndex) => (
                        <label 
                          key={optIndex}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-2 p-4 rounded-lg transition-colors border",
                            isViewMode ? "cursor-default" : "cursor-pointer",
                            answers[question.id] === option 
                              ? "bg-secondary/10 border-secondary" 
                              : "bg-muted/30 border-border hover:bg-muted/50"
                          )}
                        >
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={option}
                            checked={answers[question.id] === option}
                            onChange={() => handleAnswerChange(question.id, option)}
                            disabled={isViewMode}
                            className="sr-only"
                          />
                          <span className={cn(
                            "text-lg font-medium",
                            answers[question.id] === option ? "text-secondary" : "text-foreground"
                          )}>
                            {option}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Fill in the Blank */}
                  {question.type === "fillblank" && (
                    <div className="ml-11">
                      <input
                        type="text"
                        placeholder={isViewMode ? "No answer provided" : "Type your answer here..."}
                        value={answers[question.id] || ""}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        disabled={isViewMode}
                        className={cn(
                          "w-full h-12 px-4 rounded-lg bg-muted/30 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                          isViewMode && "cursor-default opacity-80"
                        )}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-card border-t border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous Page
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage === totalPages - 1}
          >
            Next Page
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {!isViewMode && (
          <Button 
            size="lg" 
            onClick={() => setShowConfirmSubmit(true)}
            className="gap-2"
          >
            <Send className="w-4 h-4" />
            Submit Quiz
          </Button>
        )}
      </div>

      {/* Confirm Submit Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-foreground/20 backdrop-blur-sm">
          <div className="bg-card rounded-xl border border-border p-6 max-w-md w-full m-4 animate-fade-in">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-warning flex-shrink-0" />
              <div>
                <h3 className="font-display font-semibold text-lg">Submit Quiz?</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  You have answered <strong>{getAnsweredCount()}</strong> out of <strong>{quiz.questions.length}</strong> questions.
                </p>
                {getAnsweredCount() < quiz.questions.length && (
                  <p className="text-sm text-warning mt-2">
                    ⚠️ You still have {quiz.questions.length - getAnsweredCount()} unanswered questions.
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-2">
                  Once submitted, you cannot change your answers.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowConfirmSubmit(false)}>
                Continue Quiz
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Quiz"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
