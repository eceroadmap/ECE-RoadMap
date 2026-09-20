import { useState, useEffect, useCallback } from 'react';
import { 
  StudentProfile, 
  CourseProgressStatus, 
  SavedLaptopRecord,
  CourseGrade,
  GraduationProjectWorkspace
} from '../types';
import { studentRepository, subscribeToStudentStore } from './studentRepository';
import { firebaseSyncService, CloudSyncStatus } from './firebaseSync';
import { User } from '../lib/firebase';

export function useStudentState() {
  const [profile, setProfileState] = useState<StudentProfile>(studentRepository.getProfile());
  const [courseProgress, setCourseProgressState] = useState<Record<string, CourseProgressStatus>>(
    studentRepository.getCourseProgress()
  );
  const [academicGrades, setAcademicGradesState] = useState<Record<string, CourseGrade>>(
    studentRepository.getAcademicGrades()
  );
  const [graduationWorkspace, setGraduationWorkspaceState] = useState<GraduationProjectWorkspace>(
    studentRepository.getGraduationWorkspace()
  );
  const [savedLaptop, setSavedLaptopState] = useState<SavedLaptopRecord | null>(
    studentRepository.getSavedLaptop()
  );
  const [firebaseUser, setFirebaseUser] = useState<User | null>(firebaseSyncService.getUser());
  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>(firebaseSyncService.getSyncStatus());
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(firebaseSyncService.getLastSyncedAt());

  useEffect(() => {
    const unsubStore = subscribeToStudentStore(() => {
      setProfileState(studentRepository.getProfile());
      setCourseProgressState(studentRepository.getCourseProgress());
      setAcademicGradesState(studentRepository.getAcademicGrades());
      setGraduationWorkspaceState(studentRepository.getGraduationWorkspace());
      setSavedLaptopState(studentRepository.getSavedLaptop());
    });

    const unsubAuth = firebaseSyncService.subscribeAuth((user) => {
      setFirebaseUser(user);
    });

    const unsubStatus = firebaseSyncService.subscribeStatus((status) => {
      setSyncStatus(status);
    });

    const unsubSyncTime = firebaseSyncService.subscribeLastSynced((time) => {
      setLastSyncedAt(time);
    });

    return () => {
      unsubStore();
      unsubAuth();
      unsubStatus();
      unsubSyncTime();
    };
  }, []);

  const updateProfile = useCallback((updated: Partial<StudentProfile>) => {
    const result = studentRepository.saveProfile(updated);
    firebaseSyncService.pushLocalToCloud();
    return result;
  }, []);

  const setCourseStatus = useCallback((courseId: string, status: CourseProgressStatus | null) => {
    const result = studentRepository.setCourseStatus(courseId, status);
    firebaseSyncService.pushLocalToCloud();
    return result;
  }, []);

  const saveCourseGrade = useCallback((grade: CourseGrade) => {
    const result = studentRepository.saveCourseGrade(grade);
    firebaseSyncService.pushLocalToCloud();
    return result;
  }, []);

  const removeCourseGrade = useCallback((courseId: string) => {
    const result = studentRepository.removeCourseGrade(courseId);
    firebaseSyncService.pushLocalToCloud();
    return result;
  }, []);

  const saveGraduationWorkspace = useCallback((updated: Partial<GraduationProjectWorkspace>) => {
    const result = studentRepository.saveGraduationWorkspace(updated);
    firebaseSyncService.pushLocalToCloud();
    return result;
  }, []);

  const toggleStarredProject = useCallback((projectId: string) => {
    const result = studentRepository.toggleStarredProject(projectId);
    firebaseSyncService.pushLocalToCloud();
    return result;
  }, []);

  const saveLaptop = useCallback((specs: any, evaluation: any) => {
    const result = studentRepository.saveLaptop(specs, evaluation);
    firebaseSyncService.pushLocalToCloud();
    return result;
  }, []);

  const removeSavedLaptop = useCallback(() => {
    studentRepository.removeSavedLaptop();
    firebaseSyncService.pushLocalToCloud();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    return await firebaseSyncService.signInWithGoogle();
  }, []);

  const signOut = useCallback(async () => {
    return await firebaseSyncService.signOut();
  }, []);

  return {
    profile,
    courseProgress,
    academicGrades,
    graduationWorkspace,
    savedLaptop,
    firebaseUser,
    syncStatus,
    lastSyncedAt,
    isLoggedInWithGoogle: Boolean(firebaseUser),
    isCloudSynced: syncStatus === 'synced',
    updateProfile,
    setCourseStatus,
    saveCourseGrade,
    removeCourseGrade,
    saveGraduationWorkspace,
    toggleStarredProject,
    saveLaptop,
    removeSavedLaptop,
    signInWithGoogle,
    signOut
  };
}

