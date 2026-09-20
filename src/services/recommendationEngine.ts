import { GraduationProject, StudentProjectPreferences, ProjectMatchResult } from '../types/graduationProject';

export const RECOMMENDATION_WEIGHTS = {
  courseMatch: 0.30,     // 30% weight for related course overlap
  skillToolMatch: 0.30,  // 30% weight for skill & software/tool overlap
  interestMatch: 0.25,   // 25% weight for interest area & tag overlap
  difficultyMatch: 0.10, // 10% weight for difficulty preference
  typeMatch: 0.05        // 5% weight for project type preference
};

export const RECOMMENDATION_ENGINE = {
  calculateMatch(project: GraduationProject, prefs: StudentProjectPreferences): ProjectMatchResult {
    const favoriteCourses = prefs.favoriteCourseIds || [];
    const interests = prefs.interestAreas || [];
    const skills = prefs.selectedSkills || [];
    const tools = prefs.selectedTools || [];
    const preferredDiff = prefs.preferredDifficulty || 'all';
    const preferredType = prefs.projectTypePreference || 'all';

    // 1. Course overlap matching
    const projectCourses = project.relatedCourseIds || [];
    const matchingCourses = projectCourses.filter(cId => favoriteCourses.includes(cId));
    const courseScore = projectCourses.length > 0 
      ? Math.min(1, matchingCourses.length / Math.max(1, Math.min(projectCourses.length, 3))) 
      : (favoriteCourses.length === 0 ? 0.5 : 0);

    // 2. Skill & Tool overlap matching
    const projectSkills = [
      ...(project.requiredSkills || []),
      ...(project.requiredSkillIds || [])
    ].map(s => s.toLowerCase());

    const projectTools = [
      ...(project.requiredSoftware || []),
      ...(project.requiredSoftwareIds || [])
    ].map(t => t.toLowerCase());

    const userSkillsLower = skills.map(s => s.toLowerCase());
    const userToolsLower = tools.map(t => t.toLowerCase());

    const matchingSkills = projectSkills.filter(ps => userSkillsLower.some(us => ps.includes(us) || us.includes(ps)));
    const matchingTools = projectTools.filter(pt => userToolsLower.some(ut => pt.includes(ut) || ut.includes(pt)));

    const missingSkills = projectSkills.filter(ps => !userSkillsLower.some(us => ps.includes(us) || us.includes(ps)));
    const missingTools = projectTools.filter(pt => !userToolsLower.some(ut => pt.includes(ut) || ut.includes(pt)));

    const totalReqSkills = Math.max(1, projectSkills.length);
    const totalReqTools = Math.max(1, projectTools.length);
    const skillScore = (matchingSkills.length / totalReqSkills);
    const toolScore = (matchingTools.length / totalReqTools);
    const skillToolScore = (skillScore + toolScore) / 2;

    // 3. Interest & Tag matching
    const projectTags = [
      ...(project.tags || []),
      project.track || '',
      project.field || '',
      project.category || '',
      project.summaryAr || '',
      project.titleAr || ''
    ].map(t => t.toLowerCase());

    const matchingInterests = interests.filter(interest => {
      const lower = interest.toLowerCase();
      return projectTags.some(tag => tag.includes(lower));
    });

    const interestScore = interests.length > 0 
      ? Math.min(1, matchingInterests.length / Math.max(1, Math.min(interests.length, 3)))
      : 0.5;

    // 4. Difficulty matching
    let difficultyMatch = true;
    let diffScore = 1.0;
    if (preferredDiff !== 'all' && project.difficulty) {
      if (project.difficulty === preferredDiff) {
        diffScore = 1.0;
        difficultyMatch = true;
      } else {
        diffScore = 0.6;
        difficultyMatch = false;
      }
    }

    // 5. Type matching
    let typeMatch = true;
    let typeScore = 1.0;
    if (preferredType !== 'all' && project.type) {
      if (project.type === preferredType) {
        typeScore = 1.0;
        typeMatch = true;
      } else {
        typeScore = 0.5;
        typeMatch = false;
      }
    }

    // Weighted composite score (0 to 100)
    const rawScore = 
      (courseScore * RECOMMENDATION_WEIGHTS.courseMatch) +
      (skillToolScore * RECOMMENDATION_WEIGHTS.skillToolMatch) +
      (interestScore * RECOMMENDATION_WEIGHTS.interestMatch) +
      (diffScore * RECOMMENDATION_WEIGHTS.difficultyMatch) +
      (typeScore * RECOMMENDATION_WEIGHTS.typeMatch);

    const score = Math.round(Math.max(15, Math.min(99, rawScore * 100)));

    // Generate recommendation reason summary in Arabic
    let reasonAr = '';
    if (matchingCourses.length > 0 && matchingInterests.length > 0) {
      reasonAr = `يتطابق هذا المشروع بشكل ممتاز مع مقرراتك المفضلة واهتماماتك في مجالات (${matchingInterests.slice(0, 2).join('، ')}).`;
    } else if (matchingSkills.length > 0) {
      reasonAr = `يتوافق المشروع مع مهاراتك البرمجية والعملية في (${matchingSkills.slice(0, 2).join('، ')}).`;
    } else {
      reasonAr = `مشروع هندسي واعد في مجال ${project.trackAr || project.field || 'الاتصالات والإلكترونيات'}.`;
    }

    return {
      project,
      score,
      breakdown: {
        courseMatchCount: matchingCourses.length,
        interestMatchCount: matchingInterests.length,
        skillMatchCount: matchingSkills.length,
        toolMatchCount: matchingTools.length,
        difficultyMatch,
        typeMatch
      },
      matchingCourses,
      matchingInterests,
      matchingSkills,
      matchingTools,
      missingSkills,
      missingTools,
      recommendationReasonAr: reasonAr
    };
  },

  getRecommendations(projects: GraduationProject[], prefs: StudentProjectPreferences): ProjectMatchResult[] {
    const activeProjects = projects.filter(p => p.active !== false);
    const results = activeProjects.map(proj => this.calculateMatch(proj, prefs));
    
    results.sort((a, b) => {
      // 1. Compatibility score DESC
      if (b.score !== a.score) return b.score - a.score;
      
      // 2. Number of meaningful matches DESC
      const aMatches = a.breakdown.courseMatchCount + a.breakdown.interestMatchCount + a.breakdown.skillMatchCount + a.breakdown.toolMatchCount;
      const bMatches = b.breakdown.courseMatchCount + b.breakdown.interestMatchCount + b.breakdown.skillMatchCount + b.breakdown.toolMatchCount;
      if (bMatches !== aMatches) return bMatches - aMatches;
      
      // 3. Stable project ID
      return a.project.id.localeCompare(b.project.id);
    });

    return results;
  }
};
