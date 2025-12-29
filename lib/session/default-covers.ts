/**
 * Default cover styles for sessions without a cover_url
 * Provides light, premium gradient backgrounds per sport
 */

export type SportType = "badminton" | "pickleball" | "volleyball" | "other" | "futsal"

export type CoverStyle = {
  kind: "color"
  value: string // CSS gradient value
}

/**
 * Get the default cover style for a sport
 * Returns a light gradient background that matches the sport theme
 */
export function getDefaultCoverForSport(sport: SportType | string | null | undefined): CoverStyle {
  // Normalize sport value (handle case differences and "other" -> "futsal" mapping)
  const normalizedSport = normalizeSport(sport)

  switch (normalizedSport) {
    case "badminton":
      return {
        kind: "color",
        value: "linear-gradient(135deg, #F3FFEF 0%, #E4FFDA 55%, #D8FFD0 100%)", // Very light lime green
      }
    case "pickleball":
      return {
        kind: "color",
        value: "linear-gradient(135deg, #F1FAFF 0%, #E2F2FF 60%, #D6ECFF 100%)", // Very light sky
      }
    case "volleyball":
      return {
        kind: "color",
        value: "linear-gradient(135deg, #FFF8EE 0%, #FFF0D9 60%, #FFE8C6 100%)", // Very light sand
      }
    case "futsal":
      return {
        kind: "color",
        value: "linear-gradient(135deg, #F7F5FF 0%, #EEE9FF 60%, #E6E0FF 100%)", // Very light lavender/grey
      }
    case "other":
    default:
      // Default to badminton gradient for unknown sports
      return {
        kind: "color",
        value: "linear-gradient(135deg, #F3FFEF 0%, #E4FFDA 55%, #D8FFD0 100%)",
      }
  }
}

/**
 * Get React CSS properties for default cover
 * Can be used directly in style prop
 */
export function getDefaultCoverStyle(sport: SportType | string | null | undefined): React.CSSProperties {
  const cover = getDefaultCoverForSport(sport)
  return {
    background: cover.value,
  }
}

/**
 * Normalize sport value to handle case differences and mappings
 * Maps "Badminton" -> "badminton", "Futsal" -> "futsal", "other" -> "futsal" (if needed)
 */
function normalizeSport(sport: SportType | string | null | undefined): SportType {
  if (!sport) return "badminton" // Default fallback

  const lower = sport.toLowerCase()

  // Handle "other" -> could be futsal, but we'll keep it as other for now
  // If you want to map "other" to "futsal", uncomment this:
  // if (lower === "other") return "futsal"

  // Map to valid sport types
  if (["badminton", "pickleball", "volleyball", "futsal", "other"].includes(lower)) {
    return lower as SportType
  }

  // Handle capitalized versions
  if (sport === "Badminton") return "badminton"
  if (sport === "Pickleball") return "pickleball"
  if (sport === "Volleyball") return "volleyball"
  if (sport === "Futsal") return "futsal"

  // Default fallback
  return "badminton"
}

