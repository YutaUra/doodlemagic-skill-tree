type MagicSkillMap = {
	スペルミサイル:
		| "スペルミサイルゲイン"
		| "ミサイル連射"
		| "拡散ミサイル"
		| "拡散ミサイルゲイン"
		| "飛び散るミサイル"
		| "サブミサイルゲイン"
		| "ミサイル斉射"
		| "突通ミサイル1"
		| "突通ミサイル2"
		| "エネチャミサイル"
		| "爆破ミサイル"
		| "爆発拡散"
		| "爆破ゲイン"
		| "炎ミサイル"
		| "スペルゲインα"
		| "スペルゲインβ"
		| "ミサイルゲイン"
		| "ミサイルストーム";
	火玉術:
		| "火玉勃発"
		| "炎爆術"
		| "浸透炎"
		| "火玉爆破1"
		| "火花"
		| "火玉爆破2"
		| "猛烈燃焼"
		| "火の伝承"
		| "火玉衝撃"
		| "火玉連射1"
		| "火玉連射2"
		| "火玉連射3";
	氷柱術:
		| "氷柱ダメージゲイン"
		| "極寒氷柱"
		| "氷柱穿通"
		| "プリズム氷柱"
		| "骨食い寒さ"
		| "重氷柱"
		| "氷柱連射"
		| "氷柱衝撃"
		| "氷柱斉射"
		| "氷柱分裂"
		| "氷スライスダメージゲイン"
		| "氷スライス穿通";
	雷撃術:
		| "雷撃ダメージゲイン"
		| "雷電制裁"
		| "高圧電撃"
		| "審判の雷"
		| "連続電撃"
		| "磁気嵐"
		| "電磁場"
		| "高圧電場"
		| "安定電場"
		| "磁気嵐ダメージゲイン"
		| "磁気嵐拡張"
		| "電磁分裂"
		| "雷電魔法精通";
	ローリングログ:
		| "ローリングログダメージゲイン"
		| "連続ローリングログ1"
		| "連続ローリングログ2"
		| "連続ローリングログ3"
		| "ローリングログ拡張"
		| "大型ローリングログ"
		| "ローリングログ引火"
		| "重傷"
		| "ローリングログ急行"
		| "致傷ローリングログ"
		| "砕氷"
		| "スペアローリングログ";
	パルスレーザー:
		| "パルスダメージゲイン"
		| "強力レーザー"
		| "衰弱光線"
		| "瓦解光線"
		| "安定光線"
		| "スペルゲインγ"
		| "スペルゲインα"
		| "レーザー乱射"
		| "レーザー過積載"
		| "レーザー点滅"
		| "パルスビーム";
	フォーカスレーザー:
		| "フォーカスダメージゲイン"
		| "レーザー屈折"
		| "レーザー持続"
		| "焦点1"
		| "焦点爆破"
		| "焦点2"
		| "誘導ミサイル"
		| "スペルゲインβ"
		| "スペルゲインγ";
	霧氷スター:
		| "スターダメージゲイン"
		| "スター拡張"
		| "連続霜爆発"
		| "極寒スター"
		| "寒霜の心"
		| "絶対零度"
		| "氷晶破裂1"
		| "氷晶破裂2"
		| "骨刺す寒霜"
		| "氷雪魔法精通";
	サンダーチェーン:
		| "高圧電撃"
		| "イオン爆破"
		| "イオン電圧"
		| "交感電撃"
		| "サンダーダメージゲイン"
		| "交差サンダー"
		| "サンダー持続"
		| "電流電導"
		| "雷電魔法ゲイン";
	隕石術: never;
	竜巻: never;
	電磁ネット: never;
	榴弾: never;
	ハリケーン術: never;
	サンダーボール: never;
};

type SkillRef<MagicId extends keyof MagicSkillMap> =
	| {
			type: "skill";
			ref: MagicSkillMap[MagicId];
	  }
	| {
			type: "magic";
			ref: Exclude<keyof MagicSkillMap, MagicId>;
	  }
	| {
			type: "magic-skill";
			ref: {
				[K in Exclude<keyof MagicSkillMap, MagicId>]: {
					magic: K;
					skill: MagicSkillMap[K];
				};
			}[Exclude<keyof MagicSkillMap, MagicId>];
	  };

type MagicSkillTree = {
	[MagicId in keyof MagicSkillMap]: {
		name: string;
		skills: {
			[SkillId in MagicSkillMap[MagicId]]: {
				name: string;
				description?: string;
				needs?: [SkillRef<MagicId>, ...SkillRef<MagicId>[]];
				shares?: {
					[K in Exclude<keyof MagicSkillMap, MagicId>]: {
						magic: K;
						skill: MagicSkillMap[K];
					};
				}[Exclude<keyof MagicSkillMap, MagicId>][];
			};
		};
	};
};

export const Magics = {
	スペルミサイル: {
		name: "スペルミサイル",
		skills: {
			スペルミサイルゲイン: {
				name: "スペルミサイルゲイン",
			},
			ミサイル連射: {
				name: "ミサイル連射",
				needs: [{ type: "skill", ref: "スペルミサイルゲイン" }],
			},
			拡散ミサイル: {
				name: "拡散ミサイル",
				needs: [{ type: "skill", ref: "スペルミサイルゲイン" }],
			},
			拡散ミサイルゲイン: {
				name: "拡散ミサイルゲイン",
				needs: [{ type: "skill", ref: "拡散ミサイル" }],
			},
			飛び散るミサイル: {
				name: "飛び散るミサイル",
				needs: [{ type: "skill", ref: "拡散ミサイル" }],
			},
			サブミサイルゲイン: {
				name: "サブミサイルゲイン",
				needs: [{ type: "skill", ref: "拡散ミサイル" }],
			},
			ミサイル斉射: {
				name: "ミサイル斉射",
			},
			突通ミサイル1: {
				name: "突通ミサイル",
				needs: [{ type: "magic", ref: "氷柱術" }],
			},
			突通ミサイル2: {
				name: "突通ミサイル",
				needs: [{ type: "skill", ref: "突通ミサイル1" }],
			},
			エネチャミサイル: {
				name: "エネチャミサイル",
				needs: [{ type: "skill", ref: "突通ミサイル2" }],
			},
			爆破ミサイル: {
				name: "爆破ミサイル",
				needs: [{ type: "magic", ref: "火玉術" }],
			},
			爆発拡散: {
				name: "爆発拡散",
				needs: [{ type: "skill", ref: "爆破ミサイル" }],
			},
			爆破ゲイン: {
				name: "爆破ゲイン",
				needs: [{ type: "skill", ref: "爆破ミサイル" }],
			},
			炎ミサイル: {
				name: "炎ミサイル",
				needs: [
					{ type: "magic-skill", ref: { magic: "火玉術", skill: "火玉衝撃" } },
				],
			},
			スペルゲインα: {
				name: "スペルゲインα",
				needs: [{ type: "magic", ref: "パルスレーザー" }],
				shares: [{ magic: "パルスレーザー", skill: "スペルゲインα" }],
			},
			スペルゲインβ: {
				name: "スペルゲインβ",
				needs: [{ type: "magic", ref: "フォーカスレーザー" }],
				shares: [{ magic: "フォーカスレーザー", skill: "スペルゲインβ" }],
			},
			ミサイルゲイン: {
				name: "ミサイルゲイン",
			},
			ミサイルストーム: {
				name: "ミサイルストーム",
			},
		},
	},
	火玉術: {
		name: "火玉術",
		skills: {
			火玉勃発: {
				name: "火玉勃発",
			},
			炎爆術: {
				name: "炎爆術",
				needs: [
					{ type: "skill", ref: "火玉勃発" },
					{ type: "skill", ref: "火玉爆破1" },
				],
			},
			浸透炎: {
				name: "浸透炎",
				needs: [{ type: "skill", ref: "炎爆術" }],
			},
			火玉爆破1: {
				name: "火玉爆破",
			},
			火玉爆破2: {
				name: "火玉爆破",
				needs: [{ type: "skill", ref: "火玉爆破1" }],
			},
			火花: {
				name: "火花",
				needs: [{ type: "skill", ref: "火玉爆破1" }],
			},
			猛烈燃焼: {
				name: "猛烈燃焼",
				needs: [{ type: "skill", ref: "火玉爆破2" }],
			},
			火の伝承: {
				name: "火の伝承",
				needs: [{ type: "skill", ref: "火玉爆破2" }],
			},
			火玉衝撃: {
				name: "火玉衝撃",
			},
			火玉連射1: {
				name: "火玉連射",
			},
			火玉連射2: {
				name: "火玉連射",
				needs: [{ type: "skill", ref: "火玉連射1" }],
			},
			火玉連射3: {
				name: "火玉連射",
				needs: [{ type: "skill", ref: "火玉連射2" }],
			},
		},
	},
	氷柱術: {
		name: "氷柱術",
		skills: {
			氷柱ダメージゲイン: {
				name: "氷柱ダメージゲイン",
			},
			極寒氷柱: {
				name: "極寒氷柱",
			},
			氷柱穿通: {
				name: "氷柱穿通",
			},
			プリズム氷柱: {
				name: "プリズム氷柱",
				needs: [
					{ type: "skill", ref: "氷柱ダメージゲイン" },
					{ type: "skill", ref: "極寒氷柱" },
					{ type: "skill", ref: "氷柱穿通" },
				],
			},
			骨食い寒さ: {
				name: "骨食い寒さ",
				needs: [{ type: "skill", ref: "極寒氷柱" }],
			},
			重氷柱: {
				name: "重氷柱",
				needs: [{ type: "skill", ref: "氷柱穿通" }],
			},
			氷柱連射: {
				name: "氷柱連射",
			},
			氷柱衝撃: {
				name: "氷柱衝撃",
			},
			氷柱斉射: {
				name: "氷柱斉射",
			},
			氷柱分裂: {
				name: "氷柱分裂",
			},
			氷スライスダメージゲイン: {
				name: "氷スライスダメージゲイン",
				needs: [{ type: "skill", ref: "氷柱分裂" }],
			},
			氷スライス穿通: {
				name: "氷スライス穿通",
				needs: [{ type: "skill", ref: "氷柱分裂" }],
			},
		},
	},
	雷撃術: {
		name: "雷撃術",
		skills: {
			雷撃ダメージゲイン: {
				name: "雷撃ダメージゲイン",
			},
			雷電制裁: {
				name: "雷電制裁",
				needs: [{ type: "skill", ref: "雷撃ダメージゲイン" }],
			},
			高圧電撃: {
				name: "高圧電撃",
			},
			審判の雷: {
				name: "審判の雷",
				needs: [
					{ type: "skill", ref: "雷電制裁" },
					{ type: "skill", ref: "高圧電撃" },
				],
			},
			連続電撃: {
				name: "連続電撃",
			},
			磁気嵐: {
				name: "磁気嵐",
			},
			電磁場: {
				name: "電磁場",
				needs: [{ type: "skill", ref: "磁気嵐" }],
			},
			高圧電場: {
				name: "高圧電場",
				needs: [{ type: "skill", ref: "電磁場" }],
			},
			安定電場: {
				name: "安定電場",
				needs: [{ type: "skill", ref: "電磁場" }],
			},
			磁気嵐ダメージゲイン: {
				name: "磁気嵐ダメージゲイン",
				needs: [{ type: "skill", ref: "磁気嵐" }],
			},
			磁気嵐拡張: {
				name: "磁気嵐拡張",
				needs: [{ type: "skill", ref: "磁気嵐" }],
			},
			電磁分裂: {
				name: "電磁分裂",
			},
			雷電魔法精通: {
				name: "雷電魔法精通",
			},
		},
	},
	ローリングログ: {
		name: "ローリングログ",
		skills: {
			ローリングログダメージゲイン: {
				name: "ローリングログダメージゲイン",
			},
			連続ローリングログ1: {
				name: "連続ローリングログ",
				needs: [{ type: "skill", ref: "ローリングログダメージゲイン" }],
			},
			連続ローリングログ2: {
				name: "連続ローリングログ",
				needs: [{ type: "skill", ref: "連続ローリングログ1" }],
			},
			連続ローリングログ3: {
				name: "連続ローリングログ",
				needs: [{ type: "skill", ref: "連続ローリングログ2" }],
			},
			ローリングログ拡張: {
				name: "ローリングログ拡張",
				needs: [{ type: "skill", ref: "ローリングログダメージゲイン" }],
			},
			大型ローリングログ: {
				name: "大型ローリングログ",
				needs: [{ type: "skill", ref: "ローリングログ拡張" }],
			},
			ローリングログ引火: {
				name: "ローリングログ引火",
			},
			重傷: {
				name: "重傷",
			},
			ローリングログ急行: {
				name: "ローリングログ急行",
			},
			致傷ローリングログ: {
				name: "致傷ローリングログ",
			},
			砕氷: {
				name: "砕氷",
				needs: [{ type: "magic", ref: "霧氷スター" }],
			},
			スペアローリングログ: {
				name: "スペアローリングログ",
			},
		},
	},
	パルスレーザー: {
		name: "パルスレーザー",
		skills: {
			パルスダメージゲイン: {
				name: "パルスダメージゲイン",
			},
			強力レーザー: {
				name: "強力レーザー",
				needs: [{ type: "skill", ref: "パルスダメージゲイン" }],
			},
			衰弱光線: {
				name: "衰弱光線",
			},
			瓦解光線: {
				name: "瓦解光線",
			},
			安定光線: {
				name: "安定光線",
			},
			スペルゲインγ: {
				name: "スペルゲインγ",
				needs: [{ type: "magic", ref: "フォーカスレーザー" }],
				shares: [{ magic: "フォーカスレーザー", skill: "スペルゲインγ" }],
			},
			スペルゲインα: {
				name: "スペルゲインα",
				needs: [{ type: "magic", ref: "スペルミサイル" }],
				shares: [{ magic: "スペルミサイル", skill: "スペルゲインα" }],
			},
			レーザー乱射: {
				name: "レーザー乱射",
			},
			レーザー過積載: {
				name: "レーザー過積載",
			},
			レーザー点滅: {
				name: "レーザー点滅",
				needs: [
					{ type: "skill", ref: "パルスダメージゲイン" },
					{ type: "skill", ref: "レーザー過積載" },
				],
			},
			パルスビーム: {
				name: "パルスビーム",
				needs: [
					{ type: "skill", ref: "強力レーザー" },
					{ type: "skill", ref: "レーザー過積載" },
				],
			},
		},
	},
	フォーカスレーザー: {
		name: "フォーカスレーザー",
		skills: {
			フォーカスダメージゲイン: {
				name: "フォーカスダメージゲイン",
			},
			レーザー屈折: {
				name: "レーザー屈折",
				needs: [{ type: "skill", ref: "フォーカスダメージゲイン" }],
			},
			レーザー持続: {
				name: "レーザー持続",
			},
			焦点1: {
				name: "焦点",
			},
			焦点爆破: {
				name: "焦点爆破",
				needs: [{ type: "skill", ref: "焦点1" }],
			},
			焦点2: {
				name: "焦点",
				needs: [{ type: "skill", ref: "焦点1" }],
			},
			誘導ミサイル: {
				name: "誘導ミサイル",
				needs: [
					{ type: "skill", ref: "焦点1" },
					{ type: "magic", ref: "スペルミサイル" },
				],
			},
			スペルゲインβ: {
				name: "スペルゲインβ",
				needs: [{ type: "magic", ref: "スペルミサイル" }],
				shares: [{ magic: "スペルミサイル", skill: "スペルゲインβ" }],
			},
			スペルゲインγ: {
				name: "スペルゲインγ",
				needs: [{ type: "magic", ref: "パルスレーザー" }],
				shares: [{ magic: "パルスレーザー", skill: "スペルゲインγ" }],
			},
		},
	},
	霧氷スター: {
		name: "霧氷スター",
		skills: {
			スターダメージゲイン: {
				name: "スターダメージゲイン",
			},
			スター拡張: {
				name: "スター拡張",
				needs: [{ type: "skill", ref: "スターダメージゲイン" }],
			},
			連続霜爆発: {
				name: "連続霜爆発",
			},
			極寒スター: {
				name: "極寒スター",
			},
			寒霜の心: {
				name: "寒霜の心",
				needs: [{ type: "skill", ref: "極寒スター" }],
			},
			絶対零度: {
				name: "絶対零度",
				needs: [{ type: "skill", ref: "寒霜の心" }],
			},
			氷晶破裂1: {
				name: "氷晶破裂",
				needs: [{ type: "magic", ref: "氷柱術" }],
			},
			氷晶破裂2: {
				name: "氷晶破裂",
				needs: [{ type: "skill", ref: "氷晶破裂1" }],
			},
			骨刺す寒霜: {
				name: "骨刺す寒霜",
				needs: [{ type: "magic", ref: "氷柱術" }],
			},
			氷雪魔法精通: {
				name: "氷雪魔法精通",
				needs: [{ type: "magic", ref: "氷柱術" }],
			},
		},
	},
	サンダーチェーン: {
		name: "サンダーチェーン",
		skills: {
			高圧電撃: {
				name: "高圧電撃",
			},
			イオン爆破: {
				name: "イオン爆破",
				needs: [{ type: "skill", ref: "高圧電撃" }],
			},
			イオン電圧: {
				name: "イオン電圧",
				needs: [{ type: "skill", ref: "イオン爆破" }],
			},
			交感電撃: {
				name: "交感電撃",
				needs: [{ type: "skill", ref: "イオン電圧" }],
			},
			サンダーダメージゲイン: {
				name: "サンダーダメージゲイン",
			},
			交差サンダー: {
				name: "交差サンダー",
			},
			サンダー持続: {
				name: "サンダー持続",
			},
			電流電導: {
				name: "電流電導",
				needs: [
					{ type: "skill", ref: "サンダーダメージゲイン" },
					{ type: "skill", ref: "サンダー持続" },
				],
			},
			雷電魔法ゲイン: {
				name: "雷電魔法ゲイン",
				needs: [{ type: "magic", ref: "雷撃術" }],
			},
		},
	},
	隕石術: {
		name: "隕石術",
		skills: {},
	},
	竜巻: {
		name: "竜巻",
		skills: {},
	},
	電磁ネット: {
		name: "電磁ネット",
		skills: {},
	},
	榴弾: {
		name: "榴弾",
		skills: {},
	},
	ハリケーン術: {
		name: "ハリケーン術",
		skills: {},
	},
	サンダーボール: {
		name: "サンダーボール",
		skills: {},
	},
} as const satisfies MagicSkillTree;
