export const ProfileGoal = Object.freeze({
  LoseWeight: 'lose_weight',
  GainMuscle: 'gain_muscle',
  Conditioning: 'conditioning',
  MaintainHealth: 'maintain_health',
});
export type ProfileGoal = (typeof ProfileGoal)[keyof typeof ProfileGoal];

export const ProfileLevel = Object.freeze({
  Beginner: 'beginner',
  Intermediate: 'intermediate',
  Advanced: 'advanced',
});
export type ProfileLevel = (typeof ProfileLevel)[keyof typeof ProfileLevel];

export const ProfileEquipment = Object.freeze({
  None: 'none',
  Dumbbells: 'dumbbells',
  ResistanceBands: 'resistance_bands',
  PullUpBar: 'pull_up_bar',
  Kettlebell: 'kettlebell',
  Bench: 'bench',
  Treadmill: 'treadmill',
});
export type ProfileEquipment =
  (typeof ProfileEquipment)[keyof typeof ProfileEquipment];
