var charsArray = [];
var instanceMatcherArray = [];
var weeklyResetTime = getWeeklyResetTime();
var instances = [
	{
		id: 12749,
		name: "Atal'Dazar"
	},
	{
		id: 12752,
		name: "Freehold"
	},
	{
		id: 12763,
		name: "King's Rest"
	},
	{
		id: 12768,
		name: "Shrine of the Storm"
	},
	{
		id: 12776,
		name: "Temple of Sethraliss"
	},
	{
		id: 12779,
		name: "The MOTHERLODE!!"
	},
	{
		id: 12745,
		name: "Underrot"
	},
	{
		id: 12782,
		name: "Tol Dagor"
	},
	{
		id: 12785,
		name: "Waycrest Manor"
	},
	{
		id: 12773,
		name: "Siege of Boralus"
	}
];

$(document).ready(function () {
	$("#instanceMatcherParent").append("<button>Reset</button>").find("button").click(function () {
		instanceMatcherArray = [];
		updateInstanceMatcher();
	});

	loadAndDisplayAllStandardChars();

	addCharFormListener();

});

function loadAndDisplayAllStandardChars() {
	var count = 0;
	charsArray = [];
	$.when(
		callApi("frostmane", "Apaduvet", count++),
		callApi("draenor", "Strazi", count++),
		callApi("draenor", "Schlebbe", count++),
		callApi("khadgar", "Feministfist", count++),
		callApi("frostmane", "Timsl", count++),
		callApi("frostmane", "Omegatron", count++),
		callApi("draenor", "Dewintwo", count++),
		callApi("bloodfeather", "Nammatj", count++),
		callApi("frostmane", "Bloodelfpala", count++),
		callApi("draenor", "Exalterad", count++),
		addTrackedChars(count)
	).then(function (a1) {
		printTable();
	});
}

function printTable() {
	$("#removeMe").hide();
	charsArray.sort(compare);
	$("#charList").html("");
	var fullTable = "<table style='text-align:center;'>";
	fullTable += buildTableHeader();
	for (var i = 0; i < charsArray.length; i++) {
		var oneRow = "<tr>";
		if (i === 0)
			oneRow += "<td><img style=\"width:18px;\" src=\"https://emojipedia-us.s3.amazonaws.com/thumbs/120/microsoft/135/crown_1f451.png\" /></td>";
		else if (i === charsArray.length - 1)
			oneRow += "<td><img style=\"width:18px;\" src=\"https://emojipedia-us.s3.amazonaws.com/thumbs/120/microsoft/135/baby_emoji-modifier-fitzpatrick-type-6_1f476-1f3ff_1f3ff.png\" /></td>";
		else
			oneRow += "<td></td>";
		oneRow += "<td style='text-align:left;'><div id='charname" + i + "' class='clickable'>" + charsArray[i].name + "</div></td>";
		oneRow += "</td>";
		oneRow += "<td>ilvl: " + charsArray[i].avgilvlEq + " (" + charsArray[i].avgilvl + ")</td>";
		oneRow += "<td>" + getSavedHtml(charsArray[i].ataldazar) + "</td>";
		oneRow += "<td>" + getSavedHtml(charsArray[i].freehold) + "</td>";
		oneRow += "<td>" + getSavedHtml(charsArray[i].kingsrest) + "</td>";
		oneRow += "<td>" + getSavedHtml(charsArray[i].sots) + "</td>";
		oneRow += "<td>" + getSavedHtml(charsArray[i].tos) + "</td>";
		oneRow += "<td>" + getSavedHtml(charsArray[i].mother) + "</td>";
		oneRow += "<td>" + getSavedHtml(charsArray[i].underrot) + "</td>";
		oneRow += "<td>" + getSavedHtml(charsArray[i].toldagor) + "</td>";
		oneRow += "<td>" + getSavedHtml(charsArray[i].waycrest) + "</td>";
		oneRow += "<td>" + getSavedHtmls(charsArray[i].sob, charsArray[i].sobAttuned) + "</td>";
		oneRow += "</tr>";
		fullTable += oneRow;
	}
	fullTable += "</table>";
	$("#charList").html(fullTable);
	$("body").css("background", "url(https://render-eu.worldofwarcraft.com/character/" + charsArray[0].background + ") 0px 40% / 100%");
	for (var j = 0; j < charsArray.length; j++) {
		$("#charname" + j).click(function () {
			$(this).toggleClass("selected");
			var charToFind = {
				name: $(this).html()
			};
			toggleMatcherName(charsArray[findPositionInArray(charsArray, charToFind)]);
		});
	}
}

function addTrackedChars(count) {
	var trackedCharsArray = getTrackedCharsFromCookie();
	if (trackedCharsArray.length > 0) {
		for (var i = 0; i < trackedCharsArray.length; i++) {
			$.when(callApi(trackedCharsArray[i].realm, trackedCharsArray[i].charName, count++)).then(function (a1) {
				printTable();
			});
		}
	}
}

function setCookie(cname, cvalue, exdays) {
	var d = new Date();
	d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
	var expires = "expires=" + d.toUTCString();
	document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}

function getTrackedCharsFromCookie() {
	var chars = getCookie("trackedChars").split("|");
	if (chars !== "") {
		var result = [];
		for (var i = 0; i < chars.length - 1; i++) {
			var char = chars[i].split(",");
			result[i] = {
				realm: char[0],
				charName: char[1]
			};
		}
		return result;
	} else {
		return "";
	}
}

function addCharFormListener() {
	$("#trackCharForm").submit(function () {
		var form = $(this);
		var realmField = form.find("input[name=realm]");
		var realm = realmField.val();
		var charNameField = form.find("input[name=charName]");
		var charName = charNameField.val();
		realmField.val("");
		charNameField.val("");

		var cookie = getCookie("trackedChars");
		setCookie("trackedChars", ((cookie != null) ? cookie : "") + realm + "," + charName + "|", 365);

		$.when(callApi(realm, charName, charsArray.length)).then(function (a1) {
			printTable();
		});

	});

	$("#resetTrackedChars").click(function () {
		setCookie("trackedChars", "");
		loadAndDisplayAllStandardChars();
	});
}

function toggleMatcherName(charObj) {
	var positionInArray = findPositionInArray(instanceMatcherArray, charObj);
	if (positionInArray > -1)
		instanceMatcherArray.splice(positionInArray, 1);
	else
		instanceMatcherArray.push(charObj);
	updateInstanceMatcher();
}

function findPositionInArray(array, objToFind) {
	for (var i = 0; i < array.length; i++)
		if (array[i].name == objToFind.name)
			return i;
	return -1;
}

function updateInstanceMatcher() {
	if (instanceMatcherArray.length === 0) {
		$("#instanceMatcher").html("");
		$("#instanceMatcherParent").hide();
		$(".selected").removeClass("selected");
		return;
	}

	var fullHtml = "";
	var namesHtml = "<div style='display:inline-block;vertical-align:top;'>";
	for (var i = 0; i < instanceMatcherArray.length; i++)
		namesHtml += "<div>" + instanceMatcherArray[i].name + "</div>";
	namesHtml += "</div>";
	fullHtml += namesHtml;

	var instanceStatus = {
		ataldazar: true,
		freehold: true,
		kingsrest: true,
		sots: true,
		tos: true,
		mother: true,
		underrot: true,
		toldagor: true,
		waycrest: true,
		sob: true,
		sobAttuned: true
	};
	for (i = 0; i < instanceMatcherArray.length; i++) {
		if (instanceMatcherArray[i].ataldazar)
			instanceStatus.ataldazar = false;
		if (instanceMatcherArray[i].freehold)
			instanceStatus.freehold = false;
		if (instanceMatcherArray[i].kingsrest)
			instanceStatus.kingsrest = false;
		if (instanceMatcherArray[i].sots)
			instanceStatus.sots = false;
		if (instanceMatcherArray[i].tos)
			instanceStatus.tos = false;
		if (instanceMatcherArray[i].mother)
			instanceStatus.mother = false;
		if (instanceMatcherArray[i].underrot)
			instanceStatus.underrot = false;
		if (instanceMatcherArray[i].toldagor)
			instanceStatus.toldagor = false;
		if (instanceMatcherArray[i].waycrest)
			instanceStatus.waycrest = false;
		if (instanceMatcherArray[i].sob || !instanceMatcherArray[i].sobAttuned)
			instanceStatus.sob = false;
	}
	var instancesDiv = "<div id='availableInstances'>";
	if (instanceStatus.ataldazar)
		instancesDiv += "Atal'Dazar<br>";
	if (instanceStatus.freehold)
		instancesDiv += "Freehold<br>";
	if (instanceStatus.kingsrest)
		instancesDiv += "King's Rest<br>";
	if (instanceStatus.sots)
		instancesDiv += "Shrine of the Storm<br>";
	if (instanceStatus.tos)
		instancesDiv += "Temple of Sethraliss<br>";
	if (instanceStatus.mother)
		instancesDiv += "The MOTHERLODE!!<br>";
	if (instanceStatus.underrot)
		instancesDiv += "Underrot<br>";
	if (instanceStatus.toldagor)
		instancesDiv += "Tol Dagor<br>";
	if (instanceStatus.waycrest)
		instancesDiv += "Waycrest Manor<br>";
	if (instanceStatus.sob)
		instancesDiv += "Siege of Boralus<br>";
	instancesDiv += "</div>";

	fullHtml += instancesDiv;

	$("#instanceMatcher").html(fullHtml);
	$("#instanceMatcherParent").css("display", "inline-block");
}

function getSavedHtml(isSaved) {
	return getSavedHtmls(isSaved, true);
}

function getSavedHtmls(isSaved, isAttuned) {
	if (isSaved)
		return "<div class='savedCell'>saved</div>";
	else {
		if (isAttuned)
			return "<div class='unsavedCell'>free</div>";
		else
			return "<div class='notAttunedCell'>not attuned</div>";
	}
}

function buildTableHeader() {
	var tableHeader = "<tr><th></th><th></th><th></th>";
	for (var i = 0; i < instances.length; i++)
		tableHeader += "<th>" + instances[i].name + "</th>";
	tableHeader += "</tr>";
	return tableHeader;
}

function getWeeklyResetTime() {
	var curr = new Date();
	var first = curr.getDate() - curr.getDay() + 3;
	if (curr.getDay() === 0 || curr.getDay() === 1 || curr.getDay() === 2)
		first -= 7;
	if (curr.getDay() === 3 && curr.getHours() < 9)
		first -= 7;
	curr.setDate(first);
	curr.setHours(0, 0, 0);
	curr.setTime(curr.getTime() + (9 * 60 * 60 * 1000)); //add 9 hours from 00:00 -> 09:00 wed morning
	return curr.getTime();
}


function callApi(realm, charName, count) {
	return $.ajax({
		url: "https://eu.api.battle.net/wow/character/" + realm + "/" + charName,
		jsonp: "jsonp",
		dataType: "jsonp",
		data: {
			apiKey: "md77ftv99mx8dzwrrdcrk8dq63xggp4b",
			fields: "items,statistics,quests"
		},
		success: function (response) {
			var char = {
				name: response.name,
				avgilvlEq: response.items.averageItemLevelEquipped,
				avgilvl: response.items.averageItemLevel,
				background: response.thumbnail.replace("avatar", "main"),
				ataldazar: isSavedToInstance(getBfaStatistics(response), instances[0].id),
				freehold: isSavedToInstance(getBfaStatistics(response), instances[1].id),
				kingsrest: isSavedToInstance(getBfaStatistics(response), instances[2].id),
				sots: isSavedToInstance(getBfaStatistics(response), instances[3].id),
				tos: isSavedToInstance(getBfaStatistics(response), instances[4].id),
				mother: isSavedToInstance(getBfaStatistics(response), instances[5].id),
				underrot: isSavedToInstance(getBfaStatistics(response), instances[6].id),
				toldagor: isSavedToInstance(getBfaStatistics(response), instances[7].id),
				waycrest: isSavedToInstance(getBfaStatistics(response), instances[8].id),
				sob: isSavedToInstance(getBfaStatistics(response), instances[9].id),
				sobAttuned: isAttunedToInstance(response.quests, 53121)
			};
			charsArray[count] = char;
			$("#charList").append("<pre>" + padWithSpace(response.name, 20) + " ilvl: " + response.items.averageItemLevelEquipped + " (" + response.items.averageItemLevel + ")</pre>");
			//console.log(response.name + ": " + isSavedToInstance(getBfaStatistics(response), 12749));
			//console.log(getBfaStatistics(response));
		},
		error: function () {
			$("#trackedChars").prepend("<div style='color: red;font-weight:bold;'>Couldn't find character: " + charName + " on realm: " + realm + "</div>")
		}
	});
}

function isAttunedToInstance(questArray, instanceId) {
	return questArray.includes(instanceId);
}

function isSavedToInstance(expansionStatArray, instanceId) {
	return getById(expansionStatArray.statistics, instanceId).lastUpdated > weeklyResetTime;
}

function getBfaStatistics(response) {
	return getById(getById(response.statistics.subCategories, 14807).subCategories, 15409);
}

function getById(arr, id) {
	for (var d = 0, len = arr.length; d < len; d += 1) {
		if (arr[d].id === id) {
			return arr[d];
		}
	}
}

function compare(a, b) {
	// Use toUpperCase() to ignore character casing
	const x = a.avgilvl;
	const y = b.avgilvl;

	var comparison = 0;
	if (x > y) {
		comparison = 1;
	} else if (x < y) {
		comparison = -1;
	}
	return comparison * -1;
}

function padWithSpace(originalText, max) {
	var len = originalText.length;
	for (i = len; i < max; i++)
		originalText += "&nbsp;";
	return originalText;
}