    /* eslint-disable */

"use client";


import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Progress } from "@/components/ui/progress";
import { format, startOfWeek, addDays, isToday } from "date-fns";
import { BookOpen, Calendar as CalendarIcon, TrendingUp, AlertTriangle, Clock } from "lucide-react";

const subjects = {
  ADA: { name: "Analysis & Design of Algorithm", days: [1, 2, 3, 5], color: "bg-gradient-to-r from-purple-500 to-pink-500", icon: "📊" },
  "UI-UX": { name: "User Interface & Experience", days: [1, 3, 4, 5], color: "bg-gradient-to-r from-blue-500 to-cyan-500", icon: "🎨" },
  CN: { name: "Computer Networks", days: [1, 2, 4, 6], color: "bg-gradient-to-r from-green-500 to-teal-500", icon: "🌐" },
  APD: { name: "Animation principle and design", days: [2, 3, 4], color: "bg-gradient-to-r from-orange-500 to-red-500", icon: "💻" },
  PP: { name: "Programming Principles", days: [1, 4], color: "bg-gradient-to-r from-indigo-500 to-purple-500", icon: "⚡" }
};

type AttendanceRecord = {
  [subject: string]: {
    [date: string]: "present" | "absent";
  };
};

export default function SubjectDashboard() {
  const [attendance, setAttendance] = useState<AttendanceRecord>({});
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentWeek, setCurrentWeek] = useState<Date[]>([]);

  // Load attendance from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem("attendance");
    if (stored) {
      setAttendance(JSON.parse(stored));
    }
  }, []);

  // Save attendance to sessionStorage
  useEffect(() => {
    sessionStorage.setItem("attendance", JSON.stringify(attendance));
  }, [attendance]);

  // Generate current week dates
  useEffect(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    const week = Array.from({ length: 7 }, (_, i) => addDays(start, i));
    setCurrentWeek(week);
  }, []);

  const markAttendance = (subject: string, status: "present" | "absent") => {
    if (!selectedDate) return;
    const dateKey = format(selectedDate, "yyyy-MM-dd");
    setAttendance((prev) => ({
      ...prev,
      [subject]: {
        ...prev[subject],
        [dateKey]: status,
      },
    }));
  };

  const calculateStats = (subject: string) => {
    const records = attendance[subject] || {};
    const total = Object.keys(records).length;
    const attended = Object.values(records).filter((v) => v === "present").length;
    const percent = total ? Math.round((attended / total) * 100) : 0;
    const canMiss = Math.floor(total * 0.25) - (total - attended);
    const streak = calculateStreak(subject);
    return { total, attended, percent, canMiss, streak };
  };

  const calculateStreak = (subject: string) => {
    const records = attendance[subject] || {};
    const dates = Object.keys(records).sort().reverse();
    let streak = 0;
    for (const date of dates) {
      if (records[date] === "present") streak++;
      else break;
    }
    return streak;
  };

  const isClassDay = (subject: string, date: Date) => {
    const dayOfWeek = date.getDay();
    return subjects[subject].days.includes(dayOfWeek);
  };

  const getTodaysClasses = () => {
    const today = new Date();
    return Object.keys(subjects).filter(subject => isClassDay(subject, today));
  };

  const getOverallStats = () => {
    const allRecords = Object.values(attendance).flatMap(subject => Object.values(subject));
    const total = allRecords.length;
    const attended = allRecords.filter(v => v === "present").length;
    const percent = total ? Math.round((attended / total) * 100) : 0;
    return { total, attended, percent };
  };

  const getDayName = (dayIndex: number) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[dayIndex];
  };

  const overallStats = getOverallStats();
  const todaysClasses = getTodaysClasses();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Attendance Dashboard
                </h1>
                <p className="text-sm text-gray-600">Track your academic progress</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">Overall Attendance</p>
                <p className="text-2xl font-bold text-gray-800">{overallStats.percent}%</p>
              </div>
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">{overallStats.percent}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Today's Classes Alert */}
        {todaysClasses.length > 0 && (
          <div className="mb-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl shadow-lg">
            <div className="flex items-center space-x-3 mb-3">
              <Clock className="h-5 w-5 text-amber-600" />
              <h2 className="text-lg font-semibold text-amber-800">Today's Classes</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {todaysClasses.map(subject => (
                <span key={subject} className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                  {subjects[subject].icon} {subject}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Calendar Section */}
          <div className="lg:col-span-1">
            <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-xl rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <CalendarIcon className="h-5 w-5 text-blue-600" />
                  <span>Select Date</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-xl border-0 shadow-inner bg-white/40"
                />
                <div className="mt-6 space-y-2">
                  <button
                    onClick={() => setSelectedDate(new Date())}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-xl transition-all duration-200 transform hover:scale-105"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => {
                      const confirmClear = window.confirm("Are you sure you want to clear all attendance?");
                      if (confirmClear) {
                        setAttendance({});
                        sessionStorage.removeItem("attendance");
                      }
                    }}
                    className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-4 py-2 rounded-xl transition-all duration-200 transform hover:scale-105"
                  >
                    Clear All
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Subjects Grid */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Object.entries(subjects).map(([subject, config]) => {
                const { total, attended, percent, canMiss, streak } = calculateStats(subject);
                const isScheduledToday = selectedDate && isClassDay(subject, selectedDate);
                const currentStatus = attendance[subject]?.[format(selectedDate!, "yyyy-MM-dd")] || "";

                return (
                  <Card key={subject} className="bg-white/60 backdrop-blur-sm border-white/20 shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                    <CardHeader className={`${config.color} text-white relative overflow-hidden`}>
                      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
                      <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-8 -translate-x-8"></div>
                      <CardTitle className="text-xl font-bold relative z-10 flex items-center justify-between">
                        <span>{subject}</span>
                        <span className="text-2xl">{config.icon}</span>
                      </CardTitle>
                      <p className="text-white/90 text-sm relative z-10">{config.name}</p>
                    </CardHeader>
                    
                    <CardContent className="p-6 space-y-4">
                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-600">Attendance</span>
                          <span className="text-sm font-bold text-gray-800">{percent}%</span>
                        </div>
                        <Progress value={percent} className="h-2" />
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-gray-50 rounded-xl">
                          <p className="text-2xl font-bold text-gray-800">{total}</p>
                          <p className="text-xs text-gray-600">Total Classes</p>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-xl">
                          <p className="text-2xl font-bold text-green-600">{attended}</p>
                          <p className="text-xs text-gray-600">Attended</p>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-xl">
                          <p className="text-2xl font-bold text-blue-600">{streak}</p>
                          <p className="text-xs text-gray-600">Streak</p>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-xl">
                          <p className={`text-2xl font-bold ${canMiss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {canMiss >= 0 ? canMiss : 0}
                          </p>
                          <p className="text-xs text-gray-600">Can Miss</p>
                        </div>
                      </div>

                      {/* Schedule Display */}
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-600 mb-2">Schedule:</p>
                        <div className="flex flex-wrap gap-1">
                          {config.days.map(day => (
                            <span key={day} className="px-2 py-1 bg-white text-xs rounded-md text-gray-700">
                              {getDayName(day)}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Alert */}
                      {canMiss < 0 && (
                        <div className="flex items-center space-x-2 p-3 bg-red-50 rounded-xl">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <span className="text-sm text-red-600 font-medium">Attendance below 75%</span>
                        </div>
                      )}

                      {/* Attendance Toggle */}
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-600">
                          {selectedDate ? format(selectedDate, "MMM dd, yyyy") : "Select a date"}
                          {isScheduledToday && <span className="ml-2 text-green-600">📅 Class Day</span>}
                        </p>
                        {isScheduledToday ? (
                          <ToggleGroup
                            type="single"
                            value={currentStatus}
                            onValueChange={(val: "present" | "absent" | "") =>
                              val && markAttendance(subject, val)
                            }
                            className="grid grid-cols-2 gap-2"
                          >
                            <ToggleGroupItem 
                              value="present" 
                              className="data-[state=on]:bg-green-500 data-[state=on]:text-white hover:bg-green-100 transition-all duration-200"
                            >
                              ✅ Present
                            </ToggleGroupItem>
                            <ToggleGroupItem 
                              value="absent" 
                              className="data-[state=on]:bg-red-500 data-[state=on]:text-white hover:bg-red-100 transition-all duration-200"
                            >
                              ❌ Absent
                            </ToggleGroupItem>
                          </ToggleGroup>
                        ) : (
                          <div className="p-3 bg-gray-100 rounded-xl text-center text-gray-500 text-sm">
                            No class scheduled for this date.
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Weekly Overview */}
        <div className="mt-8">
          <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-xl rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span>Weekly Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 text-center">
                {currentWeek.map((date, index) => (
                  <div key={index} className={`p-3 rounded-xl ${isToday(date) ? 'bg-blue-100 border-2 border-blue-300' : 'bg-gray-50'}`}>
                    <p className="text-sm font-medium">{getDayName(date.getDay())}</p>
                    <p className="text-xs text-gray-600">{format(date, "MMM dd")}</p>
                    <div className="mt-2 space-y-1">
                      {Object.entries(subjects).map(([subject, config]) => (
                        isClassDay(subject, date) && (
                          <div key={subject} className="text-xs px-2 py-1 bg-white rounded-md flex items-center justify-center">
                            <span className="mr-1">{config.icon}</span>
                            <span>{subject}</span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}