"use client"

import { motion, useReducedMotion } from "framer-motion"
import { Check, Users, UserCheck, Wrench, Star, Phone, ShieldCheck } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

export interface ProfileCardProps {
  name?: string
  description?: string
  image?: string
  isVerified?: boolean
  followers?: number
  following?: number
  enableAnimations?: boolean
  className?: string
  onFollow?: () => void
  isFollowing?: boolean
  // Workshop-specific extensions that fit MOTOLOGA's design style:
  role?: string
  specialty?: string
  phone?: string
  completedJobs?: number
  rating?: number
  status?: 'active' | 'busy' | 'break'
  actionLabel?: string
  onAction?: () => void
}

export type ProfileHoverCardProps = ProfileCardProps;

export function ProfileCard({
  name = "Sophie Bennett",
  description = "Product Designer who focuses on simplicity & usability.",
  image = "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80",
  isVerified = true,
  followers = 312,
  following = 48,
  enableAnimations = true,
  className,
  onFollow = () => {},
  isFollowing = false,
  role,
  specialty,
  phone,
  completedJobs,
  rating = 4.9,
  status = 'active',
  actionLabel,
  onAction,
}: ProfileCardProps) {
  const [hovered, setHovered] = useState(false)
  const shouldReduceMotion = useReducedMotion()
  const shouldAnimate = enableAnimations && !shouldReduceMotion

  const containerVariants = {
    rest: { 
      scale: 1,
      y: 0,
      filter: "blur(0px)",
    },
    hover: shouldAnimate ? { 
      scale: 1.02, 
      y: -4,
      filter: "blur(0px)",
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 28,
        mass: 0.6,
      }
    } : {},
  }

  const imageVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.05 },
  }

  const contentVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      filter: "blur(4px)",
    },
    visible: { 
      opacity: 1, 
      y: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 28,
        mass: 0.6,
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 15,
      scale: 0.95,
      filter: "blur(2px)",
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
        mass: 0.5,
      },
    },
  }

  const letterVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        damping: 8,
        stiffness: 200,
        mass: 0.8,
      },
    },
  }

  return (
    <motion.div
      data-slot="profile-hover-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      initial="rest"
      whileHover="hover"
      variants={containerVariants}
      className={cn(
        "relative w-full max-w-xs sm:w-80 h-[430px] rounded-3xl border border-emerald-500/30 text-white overflow-hidden shadow-2xl shadow-black/50 cursor-pointer group backdrop-blur-sm bg-[#0E2829]",
        className
      )}
    >
      {/* Full Cover Image with fallback */}
      <motion.img
        src={image}
        alt={name}
        className="absolute inset-0 w-full h-full object-cover"
        variants={imageVariants}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onError={(e) => {
          // Fallback image if custom image fails to load
          (e.currentTarget as HTMLImageElement).src =
            "https://api.dicebear.com/7.x/avataaars/svg?seed=Mechanic&backgroundColor=c0aede";
        }}
      />

      {/* Workshop Forest Teal gradient overlays matching MOTOLOGA visual identity */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#091b1c] via-[#0E2829]/70 via-[#0E2829]/30 to-black/30" />
      <div className="absolute bottom-0 left-0 right-0 h-72 bg-gradient-to-t from-[#071516] via-[#0E2829]/90 via-[#0E2829]/50 to-transparent backdrop-blur-[2px]" />
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#061213] via-[#0E2829]/80 to-transparent backdrop-blur-sm" />

      {/* Top Status & Role Pill */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
        {role ? (
          <span className="text-[10px] font-mono font-black tracking-wider uppercase bg-[#0E2829]/80 backdrop-blur-md border border-emerald-400/40 text-[#34D399] px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md">
            <Wrench className="w-3 h-3" />
            <span>{role}</span>
          </span>
        ) : (
          <span className="text-[10px] font-mono font-black tracking-wider uppercase bg-[#0E2829]/80 backdrop-blur-md border border-emerald-400/40 text-[#34D399] px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md">
            <ShieldCheck className="w-3 h-3" />
            <span>Staff</span>
          </span>
        )}

        <span
          className={cn(
            "text-[10px] font-bold px-2.5 py-0.5 rounded-full border backdrop-blur-md capitalize flex items-center gap-1",
            status === 'active'
              ? "bg-emerald-950/80 border-emerald-400 text-emerald-300"
              : status === 'busy'
              ? "bg-amber-950/80 border-amber-400 text-amber-300"
              : "bg-slate-900/80 border-slate-600 text-slate-300"
          )}
        >
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full animate-pulse",
              status === 'active' ? "bg-[#34D399]" : status === 'busy' ? "bg-amber-400" : "bg-slate-400"
            )}
          />
          {status}
        </span>
      </div>

      {/* Content */}
      <motion.div 
        variants={contentVariants}
        initial="hidden"
        animate="visible"
        className="absolute bottom-0 left-0 right-0 p-5 space-y-3 z-10"
      >
        {/* Name and Verification */}
        <motion.div variants={itemVariants} className="flex items-center gap-2">
          <motion.h2 
            className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-md"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.02,
                }
              }
            }}
          >
            {name.split("").map((letter, index) => (
              <motion.span
                key={index}
                variants={letterVariants}
                className="inline-block"
              >
                {letter === " " ? "\u00A0" : letter}
              </motion.span>
            ))}
          </motion.h2>
          {isVerified && (
            <motion.div 
              variants={itemVariants}
              className="flex items-center justify-center w-5 h-5 rounded-full bg-[#34D399] text-slate-950 shadow-sm"
              title="Verified MOTOLOGA Technician"
              whileHover={{ 
                scale: 1.15, 
                rotate: 8,
                transition: { type: "spring", stiffness: 400, damping: 20 }
              }}
            >
              <Check className="w-3 h-3 stroke-[3]" />
            </motion.div>
          )}
        </motion.div>

        {/* Specialty Tag & Phone */}
        {(specialty || phone) && (
          <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-2 text-[11px] text-emerald-300">
            {specialty && (
              <span className="font-semibold bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                {specialty}
              </span>
            )}
            {phone && (
              <span className="font-mono text-slate-300 flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-md">
                <Phone className="w-3 h-3 text-emerald-400" />
                {phone}
              </span>
            )}
          </motion.div>
        )}

        {/* Description / Bio */}
        <motion.p 
          variants={itemVariants}
          className="text-slate-300 text-xs sm:text-[13px] leading-snug line-clamp-2 drop-shadow-sm"
        >
          {description}
        </motion.p>

        {/* Stats / Performance Metrics */}
        <motion.div 
          variants={itemVariants}
          className="flex items-center justify-between pt-1 border-t border-emerald-500/20 text-xs text-slate-300"
        >
          {completedJobs !== undefined ? (
            <div className="flex items-center gap-1.5 font-medium">
              <Wrench className="w-3.5 h-3.5 text-[#34D399]" />
              <span className="font-bold text-white">{completedJobs}</span>
              <span className="text-[11px] text-slate-400">Repairs</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#34D399]" />
              <span className="font-bold text-white">{followers}</span>
              <span className="text-[11px] text-slate-400">Followers</span>
            </div>
          )}

          {rating !== undefined ? (
            <div className="flex items-center gap-1 font-medium">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-bold text-white">{rating}</span>
              <span className="text-[11px] text-slate-400">Rating</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-[#34D399]" />
              <span className="font-bold text-white">{following}</span>
              <span className="text-[11px] text-slate-400">Following</span>
            </div>
          )}
        </motion.div>

        {/* Action Button: Assign / Follow / View Profile */}
        <motion.button
          variants={itemVariants}
          onClick={onAction || onFollow}
          whileHover={{ 
            scale: 1.02,
            transition: { type: "spring", stiffness: 400, damping: 25 }
          }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "w-full cursor-pointer py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-md flex items-center justify-center gap-2",
            actionLabel
              ? "bg-[#34D399] text-[#0E2829] hover:bg-emerald-300 active:bg-emerald-400 font-extrabold"
              : isFollowing 
              ? "bg-[#142F30] text-emerald-300 border border-emerald-500/40 hover:bg-[#1a3d3e]" 
              : "bg-[#34D399] text-slate-950 hover:bg-emerald-300 font-black",
            "transform-gpu"
          )}
        >
          {actionLabel ? (
            actionLabel
          ) : isFollowing ? (
            "Following"
          ) : (
            "Assign Job +"
          )}
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
