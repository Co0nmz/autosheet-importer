import { getPlayerData } from '../AutosheetImporter.mjs';
import { BuffPlayers } from '../AutosheetImporter.mjs';
export class AutoSheet extends pf1.applications.actor.ActorSheetPF {

	get template() {
		return `modules/autosheet-importer/template/AutoSheet.hbs`;
	}
	  
	static get defaultOptions() {
		const _default = super.defaultOptions;
		return {
			..._default,
			classes: ['pf1', 'sheet', 'actor', 'AutoSheet'],
			width: 'auto',
			height: 'auto',
			resizable: false,
		};
	}
	
	activateListeners(html) {
		super.activateListeners(html);

		html.find('.UpdateAutoSheet').on('click', async ev => {
			BuffPlayers(await getPlayerData());
			console.log("PF1 Autosheet Importer - UpdateButton");
		});
	}
}