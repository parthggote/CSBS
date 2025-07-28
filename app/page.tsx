'use client'

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Award, Users, TrendingUp, Building, CheckCircle, Star, BookOpen } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import LottieAnimation from "@/components/LottieAnimation";
import businessAnimation from "../public/lottie-business.json";
import { useEffect, useState, useRef } from "react";
import Spline from '@splinetool/react-spline';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          CSBS Platform
        </h1>
        <p className="text-xl text-center text-muted-foreground">
          Welcome to the Computer Science and Business Studies Platform
        </p>
      </div>
    </div>
  )
}
