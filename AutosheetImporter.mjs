import { AutoSheet } from './module/AutoSheet.mjs';
export { getPlayerData };
export { BuffPlayers };

const MODULE_ID = "autosheet-importer"; // Module's ID
const API_KEY = ""; // API key
const ID = ""; // Spreadsheet ID
const RANGE = "Data";

const PlayerData = await getPlayerData()
console.log(PlayerData);
/*
// 1. Retrieve list of named ranges from google sheets.
const base = `https:\/\/sheets.googleapis.com/v4/spreadsheets/${ID}`;
const res1 = await fetch(`${base}?key=${API_KEY}&fields=namedRanges(name)`);
const { namedRanges } = await res1.json();
console.log(namedRanges);
*/
async function getPlayerData() {
	const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${ID}/values/${RANGE}?key=${API_KEY}`
    );
    const { values } = await response.json();

	/*
	const data = Object.fromEntries(values[0].map(key => [key, 0]));
	delete data[""];
	//Object.entries(data).reduce((a,[k,v]) => (v ? (a[k]=v, a) : a), {})
	console.log(data);
	*/
	const [header, ...rows] = values;

	const data = {};
	for (const [key, ...row] of rows) {
		for (const [i, value] of row.entries()) {
			(data[header[i + 1]] ??= {})[key] = value;
		}
	}
	
	/*
	let data = Object.fromEntries(values[0].slice(1,values[0].length).map(i => [i, {}]))
	values.slice(1,values.length).forEach(row => {
		let row_name = row[0]
		for (const [i, element] of row.slice(1,row.length).entries()) {
			data[values[0][i+1]][row_name] = element
		}
	})
	*/
	for (const [Player] of Object.entries(data)) {
		data[Player].skill = {};
		for (const [key,value] of Object.entries(data[Player])) {
			const sk = /^skill_(?<skillId>\w+)$/.exec(key)?.groups.skillId;
			if (sk) {
				data[Player].skill[sk] = value;
				delete data[Player][key];
			}
		}
	}

	return data;

}

async function BuffPlayers(data, actorIDs) {
    // If running as the GM, get all user's character's IDs; otherwise, just get the current user's character
    if (game.user.isGM) {
        actorIDs = game.users.filter(u => u.character).map(u => u.character.id)
		console.log(actorIDs);
    } else { 
        actorIDs = [game.user.character.id]
		console.log(actorIDs);
    }
    
    for (const [Player] of Object.entries(data)) {
        // Get the actorID for this player's actor
        const actorID = game.settings.get("autosheet-importer", Player)
        
        // If that ID isn't in the previously defined list of IDs, skip this player in the data
        if (! actorIDs.includes(actorID)) continue;
        
        data[Player].actor = game.actors.get(actorID);

			//console.log(`${Player}`);
			//console.log(data[Player]);
			
			// Create AutoSheet Buff Data
			let AutosheetBuffData = {
				name: 'AutosheetBuff',
				type: 'buff',
				system: {
					description: {
						value: `<h2>Autosheet Data</h2>
								Dieser Buff generiert automatisch Daten aus dem <strong>Autosheet</strong>.`
					},
					buffType: 'perm',
					hideFromToken: true,
					active: true,
					tag: "AutosheetBuff",
					useCustomTag: true,
					changes: [
						{_id: randomID(8), formula: Number(data[Player].Str), subTarget: "str", modifier: "untyped", operator: "set", priority: 0},
						{_id: randomID(8), formula: Number(data[Player].Dex), subTarget: "dex", modifier: "untyped", operator: "set", priority: 0},
						{_id: randomID(8), formula: Number(data[Player].Con), subTarget: "con", modifier: "untyped", operator: "set", priority: 0},
						{_id: randomID(8), formula: Number(data[Player].Int), subTarget: "int", modifier: "untyped", operator: "set", priority: 0},
						{_id: randomID(8), formula: Number(data[Player].Wis), subTarget: "wis", modifier: "untyped", operator: "set", priority: 0},
						{_id: randomID(8), formula: Number(data[Player].Cha), subTarget: "cha", modifier: "untyped", operator: "set", priority: 0},
						
						{_id: randomID(8), formula: Number(data[Player].AC), subTarget: "ac", modifier: "untyped", operator: "set", priority: 0},
						{_id: randomID(8), formula: Number(data[Player].FF), subTarget: "ffac", modifier: "untyped", operator: "set", priority: 0},
						{_id: randomID(8), formula: Number(data[Player].Touch), subTarget: "tac", modifier: "untyped", operator: "set", priority: 0},
						{_id: randomID(8), formula: Number(data[Player].CMD), subTarget: "cmd", modifier: "untyped", operator: "set", priority: 0}, 
						
						//{_id: randomID(8), formula: Number(data[Player].Fort), subTarget: "fort", modifier: "untyped", operator: "set", priority: 0},
						//{_id: randomID(8), formula: Number(data[Player].Ref), subTarget: "ref", modifier: "untyped", operator: "set", priority: 0},
						//{_id: randomID(8), formula: Number(data[Player].Will), subTarget: "will", modifier: "untyped", operator: "set", priority: 0},
						
						{_id: randomID(8), formula: Number(data[Player].Init), subTarget: "init", modifier: "untyped", operator: "set", priority: 0},
					]
				},
				img: "systems/pf1/icons/skills/yellow_36.jpg"
			};

			let UpdateData = {
				"name": data[Player].Name,
				"prototypeToken.name": data[Player].Name,
				
				//clear Defenses Attribute Modifier
				"system.attributes.hpAbility": "",
				"system.attributes.init.ability": "",			
				"system.attributes.ac.normal.ability": "",
				"system.attributes.ac.touch.ability": "",
				"system.attributes.cmd.strAbility": "",
				"system.attributes.cmd.dexAbility": "",
				
				//clear Saves Attribute Modifier
				"system.attributes.savingThrows.fort.ability":"",
				"system.attributes.savingThrows.ref.ability":"",
				"system.attributes.savingThrows.will.ability":"",
				
				//set Saves
				"system.attributes.savingThrows.fort.base":Number(data[Player].Fort),
				"system.attributes.savingThrows.ref.base":Number(data[Player].Ref),
				"system.attributes.savingThrows.will.base":Number(data[Player].Will),
				
				//Set Player Max HP and Overland Speed
				"system.attributes.hp.base": Number(data[Player].MaxHP),
				"system.attributes.speed.land.base": Number(data[Player].Speed),
				
				//set Skill Bonus Ranks
				//"system.details.bonusSkillRankFormula": "",
			}
		
			for (const [Sk] of Object.entries(data[Player].skill)) {
				if (data[Player].skill[Sk] === "") {
					UpdateData[`system.skills.${Sk}.rank`] = 0;
					UpdateData[`system.skills.${Sk}.ability`] = "";
				} else {
					UpdateData[`system.skills.${Sk}.rank`] = Number(data[Player].skill[Sk]);
					UpdateData[`system.skills.${Sk}.ability`] = "";
				}
			}
		
			const AutosheetBuff = data[Player].actor.items.getName("AutosheetBuff");
			//console.log(AutosheetBuff);
			if (!AutosheetBuff) {
				await data[Player].actor.createEmbeddedDocuments("Item", [AutosheetBuffData]);
				console.log("AutosheetBuff added"); 
			} else {
				await AutosheetBuff.update(AutosheetBuffData);
				console.log("AutosheetBuff updated"); 
			}
					
			await data[Player].actor.update(UpdateData);
		}
	
}

async function registerHandlebars() {
  // register templates parts
  const templatePaths = [
        "modules/autosheet-importer/template/parts/actor-skills-front.hbs",
        "modules/autosheet-importer/template/parts/actor-skills.hbs",
  ];
  return loadTemplates( templatePaths );
}

Hooks.once("init", async ()  => {
		
	game.settings.register("autosheet-importer", "API_KEY", {
		name: ("API Key"),
		hint: ("Google Sheets API Key"),
		scope: "world",
		config: true,
		type: String,
		default: "",
	});
	
	game.settings.register("autosheet-importer", "ID", {
		name: ("GM Cheat Sheet ID"),
		hint: ("Google Sheets ID"),
		scope: "world",
		config: true,
		type: String,
		default: "",
	});
	
	for (const [Player] of Object.entries(PlayerData)) {
		//console.log({Player});
		game.settings.register("autosheet-importer", Player, {
			name: (Player),
			hint: ("Actor ID of player actor"),
			scope: "world",
			config: true,
			type: String,
			default: "",
		});
	}
	
	console.log("PF1 Autosheet Importer - Settings registered");
	
	Actors.registerSheet('autosheet-importer', AutoSheet, { label: 'AutoSheet', types: ['character'], makeDefault: false });
	
	registerHandlebars();
	
	console.log("PF1 Autosheet Importer - Charactersheet loaded");
});

Hooks.once("ready", async () => {
	BuffPlayers(await getPlayerData());
	console.log("PF1 Autosheet Importer - Ready");
}); 

Hooks.on("combatTurn", async () => {
	BuffPlayers(await getPlayerData());
	console.log("PF1 Autosheet Importer - Combat Turn");
}); 

Hooks.on("getSavingThrowAppHeaderButtons", async () => {
	BuffPlayers(await getPlayerData());
	console.log("PF1 Autosheet Importer - RequestRoll");
});

Hooks.on("renderAutoSheet", async (app) => {
   console.log("");
   const last = app._roflmao ?? 0,
   now = Date.now();
   if ((now - last) > 5_000) { // at least 5 seconds has passed
		app._roflmao = now;
		BuffPlayers(await getPlayerData());
		console.log("PF1 Autosheet Importer - Render AutoSheet");
   }
});

/*
//
//
#### Saved Functions ####
//
//
*/


/*
async function getPlayerData () {
	// Retrieve values from named ranges in google sheets.
	const ranges = namedRanges.map(({ name }) => `ranges=${encodeURIComponent(name)}`).join("&");
	const res2 = await fetch(`${base}/values:batchGet?key=${API_KEY}&${ranges}`);
	const { valueRanges } = await res2.json();

	// Create an output object.
	const res = valueRanges.reduce((o, { values }, i) => (o[namedRanges[i].name] = values, o), {});
	console.log(res);


	// Update actors:
	
	// get actors
	//const actor = await game.actors.getName("Name of Actor");

	

}
*/

/*
function letterToColumn(letter) {
  var column = 0, length = letter.length;
  for (var i = 0; i < length; i++)
  {
    column += (letter.charCodeAt(i) - 64) * Math.pow(26, length - i - 1);
  }
  return column;
}

function createJournals(skills, playername)  { //values.PlayerX und values.player[x]
	//console.log(skills);			// all Skills
	//console.log(skills[0]);		// {"Skill": "Acrobatics","": "","Bonus": "12"}
	//console.log(skills[1].Skill);	// Acrobatics
	//console.log(skills[1].Bonus); // 12	
		
	const template = `
		<table>
		<thead>
			<tr>
				<th>Skill</th>
				<th>Bonus</th>
				<th>Roll</th>
			</tr>
		</thead>
		<tbody>
			{{#each skills}}
			<tr>
				<td><b>{{this.Skill}}</b></td>
				<td>{{this.Bonus}}</td>
				<td>[[/r 1d20+{{this.Bonus}} # {{this.Skill}} - Skillcheck:]]</td>
			</tr>
			{{/each}}
		</tbody>
		</table>
	`;

	if(game.journal.getName(playername)) {
		game.journal.getName(playername).update({ content: Handlebars.compile(template)({ skills }) });
		//console.log("Journals updated");
	} else {
		JournalEntry.create({
			name: playername,
			content: Handlebars.compile(template)({ skills }),
		});
		//console.log("New journals created");
	}
}


	
	//game.modules.get(MODULE_ID).api = values;
	//game.modules.get(MODULE_ID).api = data;
	
	//data.player1["name"] = cell("B", 2);
	//data.player2["name"] = cell("O", 2);
	//data.player3["name"] = cell("AB", 2);
	//data.player4["name"] = cell("AO", 2);
	
	//console.log(data);
	
	for (let i=0; i < 36; i++)
	{
	let skillsHeader;
		data.player1["skills"] = values.slice(25, 63).map((row, i) => {
			const columns = row.slice(letterToColumn("A"), letterToColumn("G"));
			skillsHeader ??= columns;
			return columns
				.reduce((obj, column, i) => {
					obj[skillsHeader[i]] = column;
					return obj;
				}, 
			{});
    }).slice(1);
	};
	
	for (let i=0; i < 36; i++)
	{
	let skillsHeader;
		data.player2["skills"] = values.slice(25, 63).map((row, i) => {
			const columns = row.slice(letterToColumn("N"), letterToColumn("T"));
			skillsHeader ??= columns;
			return columns
				.reduce((obj, column, i) => {
					obj[skillsHeader[i]] = column;
					return obj;
				}, 
			{});
    }).slice(1);
	};
	
	for (let i=0; i < 36; i++)
	{
	let skillsHeader;
		data.player3["skills"] = values.slice(25, 63).map((row, i) => {
			const columns = row.slice(letterToColumn("AA"), letterToColumn("AG"));
			skillsHeader ??= columns;
			return columns
				.reduce((obj, column, i) => {
					obj[skillsHeader[i]] = column;
					return obj;
				}, 
			{});
    }).slice(1);
	};
	
	for (let i=0; i < 36; i++)
	{
	let skillsHeader;
		data.player4["skills"] = values.slice(25, 63).map((row, i) => {
			const columns = row.slice(letterToColumn("AN"), letterToColumn("AT"));
			skillsHeader ??= columns;
			return columns
				.reduce((obj, column, i) => {
					obj[skillsHeader[i]] = column;
					return obj;
				}, 
			{});
    }).slice(1);
	};
*/