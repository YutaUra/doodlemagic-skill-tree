export type Magic<ID extends string, SkillID extends string> = {
	id: ID;
	name: string;
	skills: Skill<SkillID>[];
};

export type Skill<SkillID extends string> = {
	id: SkillID;
	name: string;
	needs: SkillID[];
	description?: string;
};
