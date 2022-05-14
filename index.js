/// <reference types="../CTAutocomplete" />
/// <reference lib="es2015" />
import * as Core from "CorePewPer/index"
//import { addCustomCompletion } from "CustomTabCompletions";

/* TODO:
OurClean
[OurFriends]

Get chat parts by TextComponents, maybe
Add toggleable settings for like everything
colorize messages?
*/

Core.Pdata.autosave()
if (!Core.Pdata?.ignored) Core.Pdata.ignored = []
if (!Core.Pdata?.filter) Core.Pdata.filter = {}
if (!Core.Pdata?.afk) Core.Pdata.afk = {"reasons":["I'm afk!"],"joinleave":true,"guildreply":true,"webhook":""}
if (!Core.Pdata?.aliases) Core.Pdata.aliases = {};
if (!Core.Pdata?.clean) Core.Pdata.clean = [];
if (!Core.Pdata?.emojis) Core.Pdata.emojis = {	
	"hi|hello|wave":"ヾ(＾∇＾)",
	"bye|cya":"(^-^)/",
	"fp|sigh|ugh|facepalm":"( ¬_ლ)",
	"shrug":"¯\\_(ツ)_/¯",
	"nice|yay|+1":"(b＾▽＾)b",
	"sad|cry|sob":"|(╥_╥)\\",
	"huh|hmm|confused":"Σ(-᷅_-᷄๑)?",
	"mad|angry|grr":"p(╬ಠ益ಠ)/",
	"cool|rad|shades":"(▀̿Ĺ̯▀̿ ̿)",
	"bruh":"╭( ๐ _๐)╮",
	"lenny":"( ͡° ͜ʖ ͡°)",
	"blush|uwu":"≧◡≦",
	"amogus|amongus|sus":"ඞ",
	"yep|check":"✔",
	"type|writing":"✎...",
	"spell|magic":"('-')⊃━☆ﾟ.*･｡ﾟ",
	"party":"ヽ(^◇^*)/",
	"blank|empty":"ࠀ",
	"blank2|empty2":"⛬",
	"ez":"èƶ"
};

Array.prototype.toString = function(){return JSON.stringify(this)}
Array.prototype.remove = function(element){return this.splice(this.indexOf(element),1)}
function censor(msg, filter){
	let nmsg = new Message()
	filter = filter.toLowerCase(); // just in case
	msg.getMessageParts().forEach(msgpart => {
		
		if (Core.removeFormatting(msgpart.getText().toLowerCase()).toLowerCase().includes(filter)){
			let msgpartz = msgpart.getText().toLowerCase().split(filter) // all the normal segments of the message
			let msgclick = [msgpart.getClickAction(),msgpart.getClickValue()]
			let msghover = [msgpart.getHoverAction(),msgpart.getHoverValue()] // save original formatting
			
			msgpartz.slice(undefined,-1).forEach(mp => {
				let mpn = new TextComponent(Core.getColorCode(nmsg.getFormattedText())+mp).setFormatted(true) // remove suffixing reset format
				if (msgclick[0] && msgclick[1]) mpn = mpn.setClick(...msgclick)
				if (msghover[0] && msghover[1]) mpn = mpn.setHover(...msghover)
				nmsg.addTextComponent(mpn) // add the unmatched part back into the message, with appropriate formatting

				nmsg.addTextComponent(new TextComponent("&r&c"+"*".repeat(filter.length)+"&r"+Core.getColorCode(nmsg.getFormattedText())).setFormatted(true).setHover("show_text","&c&oSwear Detected: &8&o"+filter)) // add the censored swear
			})
			let mp = msgpartz.slice(-1)[0] // the last message. fencepost
			let mpn = new TextComponent(Core.getColorCode(nmsg.getFormattedText())+mp).setFormatted(true)
			if (msgclick[0] && msgclick[1]) mpn = mpn.setClick(...msgclick)
			if (msghover[0] && msghover[1]) mpn = mpn.setHover(...msghover)
			nmsg.addTextComponent(mpn) // add the final unmatched part back into the message, with appropriate formatting
		} else {
			nmsg.addTextComponent(msgpart)
		}
	})
	//console.log("Censored Message: "+nmsg.getMessageParts().map(q => q.getText()).join(""))
	//console.log(nmsg.toString())
	return nmsg
}
const ourtools = {
	generateIgnored: () => {
		ourtools.ignored = new Set();
		Core.Pdata.ignored.forEach(uuid => {
			Core.userName(uuid).then((name) => {
				ourtools.ignored.add(name)
			})
		})
	},
	afk: false,        // is afk?
	afknotif: true,    // is notification available
	ignored: new Set() // username cache for ignored
} // random global vars
const helpmsgs = {
	get: type => {
		return ChatLib.addColor(`&c${ChatLib.getChatBreak("=")}\n&r${ChatLib.getCenteredText(Core.prefix(type)+"&6Help:")}\n&r${helpmsgs[type] ?? "Error."}\n&c${ChatLib.getChatBreak("=")}`)
	},
	"OurFilter":`
&r/ourfilter add '<word>' <actions> &9- Adds 'word' to our filter, with actions.
   &aActions:&r ignore &9- OurIgnore player &r/ hide &9- Hide message &r/ censor &9- Censor match&r, pleave &9- Leave Party&r, preport &9- Watchdog Report Player
&r/ourfilter remove <'<word>',index> &9- Removes 'word', or the word at index.
&r/ourfilter list &9- Lists all filters & actions.`,
	"OurIgnore":`
&r/ourignore add <user> &9- Ignores 'user'.
&r/ourignore remove <user> &9- Unignores 'user'.
&r/ourignore list &9- Lists all ignored users. Unpaginated.
&r/ourignore reload &9- Reloads UUID => IGN cache.`,
	"OurClean":`
&r/ourclean add '<msg>' <[block,killfeed,notify]> &9- Adds 'msg' to OurClean, with actions.
   &7Use '&' instead of the section symbol. RegEx filters must be surrounded by '/'.
&r/ourclean remove <'<msg>',num> &9- Removes 'msg' from OurClean, or the msg at num.
&r/ourclean list &9- Lists all messages & actions.`,
	"OurAFK":`
&r/ourafk toggle (/afk) &9- Toggle OurAFK.
&r/ourafk debug &9- View OurAFK status.
&r/ourafk config reasons <add/remove/list> <text> &9- Modify & View OurAFK reasons.
&r/ourafk config <joinleave/guildreply> &9- Toggle afk join/leave messages and guild mention afk replies.
&r/ourafk config webhook <get/set> <(Your webhook url)> &9- Get/Set your notification webhook url.
   &7Originally made by BlueSkeppy and xMdP, revamped by AutomaticKiller, rerevamped elaborately by ComPewPer.`,
   "EmoticonZ":`
&r/em &9- Lists all available emojis.
&r/em add <emoji> <name> &9- Adds :name: that turns into <emoji>.
&r/em remove &9- Removes one name from an emoji.
&r/em coords <chat> &9- Sends your current coordinates to <chat>.
&r:<emojiname>: &9- Sends the emoji associated with <emojiname>.
`,
   "OurAliases":`
&r/ouraliases add <aliasname> /<command> &9- Adds /<alias>, which runs /<command>.
&r/ouraliases remove <alias/index> &9- Removes 'alias' or the alias at index.
&r/ouraliases list &9- Lists all aliases. Unpaginated.`,
}
register("gameLoad",ourtools.generateIgnored);

Core.Pregister("message", onMessage);
Core.Pregister("directmessage",onDM);
Core.Pregister("party", onParty);
Core.Pregister("visit", onVisit);
Core.Pregister("joinleave",onJoinLeave)
register("command",() => ChatLib.chat(Core.prefix("OurTools")+"&6Commands:&r &9/ourfilter&r, &9/ourafk&r, &9/ourignore&r, &9/em&r, &9/ouraliases&r")).setName("ourhelp")
register("command",ourFCommands).setName("ourfilter"); //1-1
register("command",ourACommands).setName("ourafk");    //1-2
register("command",ourICommands).setName("ourignore"); //1-3
register("command",ourECommands).setName("em");		   //1-4
register("command",ourZCommands).setName("ouraliases");//1-5
register("command",ourCCommands).setName("ourclean");  //1-6
function onMessage(chattype, rank, name, message, event) {
	if (ourtools.ignored.has(name)) return cancel(event); // hide ignored messages
	
	const oldmsg= new Message(event) // 2.0.0 patch functionality
	let fullmsg = new Message(event)
	//console.log(`${Core.removeFormatting(fullmsg.getFormattedText())} || <${chattype}> [${rank}] ${name}: ${message}`)
	for ([filter,actions] of Object.entries(Core.Pdata.filter)) {
		if (message.toLowerCase().includes(filter.toLowerCase())) {
			if(actions.includes("ignore")) {
				ourICommands('add',name,silent=true);
				fullmsg = undefined;
				break; // exit and hide msg
			}else if (actions.includes("hide")) {
				fullmsg = undefined;
				break; // exit and hide msg
			}else if (actions.includes("censor")) {
				fullmsg = censor(fullmsg,filter);
				//fullmsg = new Message(fullmsg.getFormattedText().replace(new RegExp(Core.escapeRegex(filter),"g"),"&c"+"*".repeat(filter.length)+"&r")) // fix this to re-add formatting
			}
			if (chattype.includes("Party")){
				if(actions.includes("pleave")) ChatLib.command("p leave");
				if(actions.includes("preport")) ChatLib.command(`wdr ${name} -b PC_C`);
			}
		}
	}
	
	if (!fullmsg || fullmsg?.getFormattedText() !== oldmsg.getFormattedText()){
		cancel(event)
		if (fullmsg) {fullmsg.chat()}
		else {console.info("Hid message: "+message)} // logs hidden messages in case you want to see them
	}

	if (ourtools.afk && Core.Pdata.afk.guildreply && chattype.includes("Guild") && message.toLowerCase().includes(Player.getName().toLowerCase())) ChatLib.command(`gc Hey ${name}, ${Core.randList(Core.Pdata.afk.reasons)}`)
}
function onDM(rank,name,message,event){
	onMessage("DM",undefined,name,message,event) // pass to main message trigger, for consistency
	if (ourtools.afk) ChatLib.command(`w ${name} ${Core.randList(Core.Pdata.afk.reasons)}`)
}
function onParty(inviter, owner, event) {
	if (ourtools.ignored.has(inviter) || ourtools.ignored.has(owner)) return cancel(event);
	if (ourtools.afk) {
		new Thread(() => {
			Thread.sleep(2000);
			ChatLib.command("p accept "+inviter)
			Thread.sleep(1000);
			ChatLib.command("pc "+Core.randList(Core.Pdata.afk.reasons))
			Thread.sleep(1000);
			ChatLib.command("p leave")
		}).start()
	}
}
function onVisit(rank, visitor, event) {
	if (ourtools.afk){
		if (Core.getLoc().includes("Your Island")){
			ChatLib.command(`ac Hey ${visitor}, ${Core.randList(Core.Pdata.afk.reasons)}`)
		}else{
			ChatLib.command(`w ${visitor} ${Core.randList(Core.Pdata.afk.reasons)}`)
		}
	}
}
function onJoinLeave(type,name,action,event) {
	if ((ourtools.afk && Core.Pdata.afk.joinleave)) cancel(event)
}
function ourFCommands(choice, ...args) {
	let prefix = Core.prefix("OurFilter")
	let errors = {syntax:`Incorrect syntax! Use /ourfilter for help!`,alrin:" is already being filtered! Remove it first!",notin:" wasn't a filter! Add it first."}

	let filter = Core.Pdata.filter
	args = args?.join(" ") ?? ""
	let argz;
	let filterword;
	let filteractions;
	switch (choice){
		case 'add':
			if (!(
				((argz = args.split("'")).length === 3)
				&& (filteractions = argz[2].replace(/\s/g,"").split(","))
				&& filteractions[0]?.length > 0
				&& (filterword = argz[1]?.toLowerCase()).length > 1
			)) return new Message(prefix+errors.syntax).setChatLineId(10000).chat()
			if(Object.keys(filter).includes(filterword)) return new Message(`${prefix}'${filterword}'${errors.alrin}`).setChatLineId(10001).chat()
			Core.Pdata.filter[filterword] = filteractions
			new Message(prefix+`'${filterword}' is now being filtered!`).chat() // no id because i want the messages to stay
		break;
		case 'remove':
			if (!
				(filterword = args?.split("'").length === 3 
					? args.split(`'`)[1] 
					: (!isNaN(args.replace(/\s/g,""))
						? Object.keys(filter)[Number(args.replace(/\s/g,""))-1] 
						: false
					)
				)
			) return new Message(prefix+errors.syntax).setChatLineId(10000).chat()
			if(!Object.keys(filter).includes(filterword)) return new Message(`${prefix}'${filterword}'${errors.notin}`).setChatLineId(10001).chat()
			delete Core.Pdata.filter[filterword]
			new Message(prefix+`'${filterword}' is no longer being filtered!`).chat() // message stacking enabled; no id
		break;
		case 'list':
			new Message(prefix+"OurFilter:\n").setChatLineId(1131)
				.addTextComponent(Object.keys(Core.Pdata.filter).length > 0 ? (Object.entries(filter).map(([k,v],i) => `${prefix} ${i+1}> '${k}': ${v.join(", ")}`)).join("\n") : `\n${prefix}None!`)
				.chat()
		break;
		default:
			new Message(helpmsgs.get("OurFilter")).setChatLineId(1140).chat()
		break;
	}
}
function ourICommands(choice, subchoice, silent=false){
	let prefix = Core.prefix("OurIgnore")
	let errors = {syntax:`Incorrect syntax! Use /ourignore for help!`,alrin:" is already ignored! Unignore them first.",notin:" wasn't ignored! Ignore them first.",invalid:"Invalid User."}
	switch(choice){
		case 'add':
			if (!subchoice) return new Message(prefix+errors.syntax).setChatLineId(10000).chat()
			Core.userUUID(subchoice).then(uuid => {
				if (Core.Pdata.ignored.includes(uuid)){if(!silent)new Message(`${prefix}'${subchoice}'${errors.alrin}`).setChatLineId(10001).chat();return}
				Core.Pdata.ignored.push(uuid)
				ourtools.generateIgnored()
				ChatLib.chat(prefix+`${subchoice} is now being ignored.`) //should stack
			}).catch(e => {
				new Message(prefix+errors.invalid).setChatLineId(10002).chat()
			})
		break;
		case 'remove':
			if (!subchoice) return new Message(prefix+errors.syntax).setChatLineId(10000).chat()
			Core.userUUID(subchoice).then(uuid => {
				if (!Core.Pdata.ignored.includes(uuid)){if(!silent)new Message(`${prefix}'${subchoice}'${errors.notin}`).setChatLineId(10001).chat();return}
				Core.Pdata.ignored.splice(Core.Pdata.ignored.indexOf(uuid),1)
				ourtools.generateIgnored()
				ChatLib.chat(prefix+`${subchoice} was removed from the ignore list.`) //should stack
			}).catch(e => {
				new Message(prefix+errors.invalid).setChatLineId(10002).chat()
			})
		break;
		case 'list':
			// ourtools.generateIgnored() //just in case! - removed cuz cant promisify
			new Message(`${prefix}OurIgnored:\n${prefix}- `+(ourtools.ignored.size > 0 ? ourtools.ignored.join(`\n${prefix}- `) : "None!")).setChatLineId(1331).chat()
		break;
		case 'reload':
			new Message(prefix+"Converting UUID => IGN! Please do not do anything during this time.").setChatLineId(1350).chat()
			ourtools.generateIgnored()
			new Thread(() => {
				while (ourtools.ignored.length < Core.Pdata.ignored.length){
					// wait for completion
				}
				new Message(prefix+"UUID => IGN conversion complete!").setChatLineId(1350).chat()
			}).start()
		break;
		default:
			new Message(helpmsgs.get("OurIgnore")).setChatLineId(1340).chat()
		break;
	}
}
function ourACommands(choice, subchoice, sub2, ...args) {
	let prefix = Core.prefix("OurAFK")
	let errors = {syntax:`Incorrect syntax! Use /ourafk for help!`}
	switch (choice){
        case 'toggle': 
			if (!(ourtools.afk = !ourtools.afk)) ourtools.afknotif = true;
			new Message(prefix+(ourtools.afk ? "&aYou are now AFK!" : "&cYou are no longer AFK!")).setChatLineId(1210).chat()
		break;
		case 'debug':
			new Message(prefix+(ourtools.afk ? "&aYou are currently AFK." : "&cYou are not AFK.")).setChatLineId(1221).chat()
		break;
		case 'config': // requires rework
			let da = Core.Pdata.afk
			switch (subchoice){
				case 'reasons':
					let argz = args.join(" ")
					switch (sub2){
						case 'add':
							if (!da.reasons.includes(argz)){
								da.reasons.push(argz)
								ChatLib.chat(prefix+"Added a message to OurAFK replies.")
							}else{
								ChatLib.chat(prefix+"You already had that message in your replies.")
							}
							break;
						case 'remove':
							if (da.reasons.includes(argz)){
								da.reasons.splice(da.reasons.indexOf(argz),1)
								ChatLib.chat(prefix+"Removed a message from OurAFK replies.")
							}else{
								ChatLib.chat(prefix+"That message wasn't in your replies.")
							}
							break;
						case 'list':
							if (!da.reasons) da.reasons.push("I'm afk!")
							ChatLib.chat(`${prefix}Available Reasons:\n${prefix}- `+da.reasons.join(`\n${prefix}- `))
							break;
					}
					break;
				case 'joinleave':
					da.joinleave = !da.joinleave
					ChatLib.chat(prefix+`&cFriend & Guild Join/Leave Messages will now be ${da.joinleave ? 'hidden' : 'shown'}.`)
					break;
				case 'guildreply':
					da.guildreply = !da.guildreply
					ChatLib.chat(prefix+`&aGuild members who mention you will ${da.guildreply ? '' : 'not '}be notified.`)
					break;
				case 'webhook':
					if (sub2 === "set"){
						da.webhook = args.join(" ").trim()
						new Message(prefix+`&aWebhook URL has been set to ${da.webhook}. `).setChatLineId(1431).chat()
					}else{
						new Message(prefix+`&aYour webhook URL is ${da.webhook}.`).setChatLineId(1432).chat()
					}
					break;
				default:
					return new Message(prefix+errors.syntax).setChatLineId(10000).chat();
			}
			break;
		default:
			new Message(helpmsgs.get("OurAFK")).setChatLineId(1240).chat()
		break;
	}
}
function ourECommands(choice, subchoice, sub2) {
	let prefix = Core.prefix("EmoticonZ")
	let chat = {"a":"ac", "p":"pc", "g":"gc", "r":"r"}[subchoice ?? "a"] ?? "w "+subchoice
	switch (choice) {
		case "add": //em add :) smiley
			if (sub2.includes("|")) return new Message(prefix+"&cEmoji name includes illegal character '|'!").setChatLineId(1410);
			let amsg;
			if (Core.Pdata.emojis[subchoice]) {
				if (new RegExp("(?:\||^)"+sub2+"(?:\||$)","i").exec(Core.Pdata.emojis[subchoice])) return new Message(prefix+`&eName '&d${sub2}&e' already exists for emoji '&d${subchoice}&e'!`).setChatLineId(1411).chat()
				Core.Pdata.emojis[subchoice] +="|"+sub2
				amsg = new Message(prefix+`&aSuccessfully added name '&d:${sub2}:&a' for '&d${subchoice}&a'!`)
			} else {
				Core.Pdata.emojis[subchoice]  =    sub2
				amsg = new Message(prefix+`&aSuccessfully added '&d${subchoice}&a' under name '&d:${sub2}:&a'!`)
			}
			amsg.setChatLineId(1412).chat();
		break;
		case "remove":
			if (Core.Pdata.emojis[subchoice]) {
				if ((match = Core.Pdata.emojis[subchoice].match(new RegExp("(?:\||^)"+sub2+"(?:\||$)","i")))) {
					Core.Pdata.emojis[subchoice].replace(match[0],"")
					if (!Core.Pdata.emojis[subchoice].length) delete Core.Pdata.emojis[subchoice];
					new Message(prefix+`&aSuccessfully removed name '&d:${sub2}:&a' from '&d${subchoice}&a'!`).setChatLineId(1423).chat();
				} else {
					return new Message(prefix+`&eName '&d${sub2}&e' doesn't exist for emoji '&d${subchoice}&e'!`).setChatLineId(1422).chat()
				}
			} else {
				return new Message(prefix+`&cEmoji '&d${subchoice}&e' doesn't exist!`).setChatLineId(1421).chat()
			}
		break;
		case "coords":
			ChatLib.command(`${chat} Coords: (${Math.round(Player.getX(),0)}, ${Math.round(Player.getY(),0)}, ${Math.round(Player.getZ(),0)})`)
		break;
		case "help":
			new Message(helpmsgs.get("EmoticonZ")).setChatLineId(1430).chat()
		break;
		case "list":
		default:
			let tmsg = new Message(prefix+"&a&lEmoji Options:").setChatLineId(1441)
			Object.entries(Core.Pdata.emojis).forEach(([key,value]) => {
				tmsg.addTextComponent(`\n &3-&r &9${key}&f: `)
					.addTextComponent(new TextComponent(`&b${value}`).setClick("run_command", "/ct copy "+value).setHover("show_text", "Copy this emoticon!"))
			})
			tmsg.chat()
	}
}
function ourZCommands(choice, subchoice, ...args){
	let prefix = Core.prefix("OurAliases")
	let errors = {syntax:`Incorrect syntax! Use /ouraliases for help!`,alrin:" is already an alias! Remove it first.",notin:" wasn't an alias! Add it first."}
	subchoice = subchoice?.toLowerCase()
	switch (choice){
		case "add": //ouraliases add dun /warp dungeon_hub
			let argz = args?.join(" ")
			if (!(subchoice && argz?.startsWith("/"))) return new Message(prefix+errors.syntax).setChatLineId(10000).chat()
			if (Object.keys(Core.Pdata.aliases).includes(subchoice)) return new Message(prefix+"'/"+subchoice+"'"+errors.alrin).setChatLineId(10001).chat()
			Core.Pdata.aliases[subchoice] = argz.slice(1)
			new Message(prefix+`'/${subchoice}' now runs '/${Core.Pdata.aliases[subchoice]}'!`).setChatLineId(1511).chat()
		break;
		case "remove": //ouralises remove dun //ouraliases remove 2
			if (!subchoice) return new Message(prefix+errors.syntax).setChatLineId(10000).chat()
			if (!isNaN(subchoice) && Number(subchoice) <= Object.keys(Core.Pdata.aliases).length) subchoice = Object.keys(Core.Pdata.aliases)[Number(subchoice)-1]
			if (!Object.keys(Core.Pdata.aliases).includes(subchoice)) return new Message(prefix+"'/"+subchoice+"'"+errors.notin).setChatLineId(10001).chat()
			delete Core.Pdata.aliases[subchoice]
			new Message(prefix+`'/${subchoice}' has returned to its default state!`).setChatLineId(1521).chat()
		break;
		case "list": //ouraliases list
			new Message(prefix+"OurAliases:\n").setChatLineId(1530)
				.addTextComponent(Object.keys(Core.Pdata.aliases).length > 0 ? (Object.entries(Core.Pdata.aliases).map(([k,v],i) => `${prefix}${i+1}> /${k} -> /${v}`)).join("\n") : `  None!`)
				.chat();
		break;
		default:
			new Message(helpmsgs.get("OurAliases")).setChatLineId(1540).chat()
		break;
	}
}
function ourCCommands(choice, ...args){
	let prefix = Core.prefix("OurClean")
	let errors = {syntax:`Incorrect syntax! Use /ourclean for help!`,alrin:"&r is already being cleaned!",notin:"&r wasn't being cleaned!"}
	args = args?.join(" ")

	switch (choice){
		case 'add':
			if (!args) return new Message(prefix+errors.syntax).setChatLineId(10000).chat()
			let toclean = args.slice(1,-1)
			if(Core.Pdata.clean.includes(toclean)) return new Message(`${prefix}'${toclean}'${errors.alrin}`).setChatLineId(10001).chat()
			Core.Pdata.clean.push(toclean)
			new Message(prefix+`&r'${toclean}&r' is now being cleaned!`).chat() // stack on
		break;
		case 'remove':
			if (!
				(toclean = args?.split("'").length === 3 
					? args.split(`'`)[1] 
					: (!isNaN(args.replace(/\s/g,""))
						? Core.Pdata.clean[Number(args.replace(/\s/g,""))-1] 
						: false
					)
				)
			) return new Message(prefix+errors.syntax).setChatLineId(10000).chat()
			if(!Core.Pdata.clean.includes(filterword)) return new Message(`${prefix}'${toclean}'${errors.notin}`).setChatLineId(10001).chat()
			Core.Pdata.clean.remove(filterword)
			new Message(prefix+`&r'${filterword}&r' is no longer being cleaned!`).chat() // message stacking enabled; no id
		break;
		case 'list':
			new Message(`${prefix}OurClean:`+(Core.Pdata.clean.length > 0 ? Core.Pdata.clean.reduce((pv,cv,i) => pv+`\n${prefix} ${i}> &r'${cv}&r'`) : `\n${prefix}- None!`)).setChatLineId(1631).chat()
		break;
		default:
			new Message(helpmsgs.get("OurClean")).setChatLineId(1640).chat()
		break;
	}
}

register("command", () => {
	let prefix = Core.prefix("OurAFK")
	ourtools.afk = !ourtools.afk;
	if (ourtools.afk) {
		ChatLib.chat(prefix+"&aYou are now AFK!");
	} else {
		ourtools.afknotif = true
		ChatLib.chat(prefix+"&cYou are no longer AFK!");
	}
}).setName("afk")
register("chat", () => {
	ourtools.afk = true;
	ChatLib.chat(Core.prefix("OurAFK")+"&aYou are now AFK because you were sent to limbo.")
}).setCriteria("&cYou are AFK. Move around to return from AFK.&r").setParameter("contains");
register("worldLoad", () => {
	if(ourtools.afk) {
		setTimeout(() => {
			if ((!Core.getLoc().includes("Island")) && ourtools.afknotif && Core.Pdata.afk.webhook) {
				Core.postWebhook(Core.Pdata.afk.webhook,"You have been kicked from your island! (AFK Kick)"+` [To '${Core.getLoc()}']`)
				ourtools.afknotif = false
			}
		}, 7*1000)
		new Message(new TextComponent(Core.prefix("OurAFK")+"&cYou are still AFK!"),new TextComponent(" &6Click to toggle AFK.").setClick("run_command", "/ourafk toggle").setHover("show_text", "Runs /ourafk toggle")).setChatLineId(6969).chat()
	}
})
register("worldunload", () => {
	setTimeout(()=>{
		if (Server.getIP() !== "") return;
		if (ourtools.afk) Core.postWebhook(Core.Pdata.afk.webhook,"You have been kicked from your island! (Disconnected)");
	},2000)
})

register("messageSent", (msg,event) => {
	let newmsg = msg

	if (msg.startsWith("/") && (ncmd = Core.Pdata.aliases[msg.slice(1).toLowerCase()])) newmsg = "/"+ncmd
	for ([emname,emval] of Object.entries(Core.Pdata.emojis)){
		emname = `:(?:${emname.replace(/([\.*?+()])/g,"\\$1")}):`
		newmsg = newmsg.replace(new RegExp(emname,"g"),emval)
	}

	if (newmsg === msg) return;
	cancel(event)
	ChatLib.say(newmsg)
}) // alias and emoji magic happens here