/**
 * GROQ queries for fetching content from Sanity CMS.
 * These are used by the CMS content service.
 */

export const QUERIES = {
  // Fetch all courses with expanded modules, lessons, and instructor
  allCourses: `*[_type == "course"] | order(_createdAt desc) {
    _id,
    title,
    "slug": slug.current,
    description,
    shortDescription,
    difficulty,
    duration,
    xpReward,
    "thumbnail": thumbnail.asset->url,
    track,
    tags,
    enrolledCount,
    "instructor": instructor-> {
      name,
      "avatar": avatar.asset->url,
      bio
    },
    "modules": modules[]-> {
      _id,
      title,
      "lessons": lessons[]-> {
        _id,
        title,
        type,
        content,
        xpReward,
        challenge
      }
    }
  }`,

  // Fetch single course by slug
  courseBySlug: `*[_type == "course" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    description,
    shortDescription,
    difficulty,
    duration,
    xpReward,
    "thumbnail": thumbnail.asset->url,
    track,
    tags,
    enrolledCount,
    "instructor": instructor-> {
      name,
      "avatar": avatar.asset->url,
      bio
    },
    "modules": modules[]-> {
      _id,
      title,
      "lessons": lessons[]-> {
        _id,
        title,
        type,
        content,
        xpReward,
        challenge
      }
    }
  }`,

  // Fetch all learning paths with course references
  learningPaths: `*[_type == "learningPath"] | order(_createdAt asc) {
    _id,
    name,
    description,
    icon,
    color,
    "courseIds": courses[]->_id
  }`,

  // Fetch single lesson by ID
  lessonById: `*[_type == "lesson" && _id == $id][0] {
    _id,
    title,
    type,
    content,
    xpReward,
    challenge
  }`,
};
