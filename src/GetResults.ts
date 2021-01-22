import type Party from './Party';

export interface Result {
	name: string,
	percentage: number,
	seats: number
}

function getPercentages(parties: Party[], nullVotes: number): [ number[], number ] {
	var voters = nullVotes;
	for (const party of parties) {
		voters += party.votes;
	}

	var percentages = [];
	for (const party of parties) {
		percentages.push(party.votes*100/voters);
	}

	return [ percentages, nullVotes*100/voters ];
}

export function dHontResults(parties: Party[], seats: number, treshold: number, nullVotes: number): [ Result[], number ] {
	// If we further calculate the percentages of an empty list of parties, the program crashes
	if (parties.length === 0) {
		return [ [], 0];
	}

	var results: Result[] = [];
	var quotinents = [];
	var [ percentages, nullVotesPercentage ] = getPercentages(parties, nullVotes);
	
	// Generating the results array; setting the coeficient as the number of votes for each party
	for (var i = 0; i < parties.length; i++) {
		results.push({
			name: parties[i].name,
			percentage: percentages[i],
			seats: 0
		});
		quotinents.push(parties[i].votes);
	}

	// Getting the $seats best quotinents; generating new ones after adding seats to their parties
	for (var j = 0; j < seats; j++) {
		var maxQuotinent = 0;
		var currentWinner = -1;
		for (var i = 0; i < parties.length; i++) {
			if (maxQuotinent < quotinents[i] && percentages[i] >= treshold) {
				maxQuotinent = quotinents[i];
				currentWinner = i;
			}
		}
		if (currentWinner > -1) {
			results[currentWinner].seats++;
			quotinents[currentWinner] = parties[currentWinner].votes / (1 + results[currentWinner].seats);
		}
	}

	// Sort the results decreasingly by percentage and return them with the null votes percentage
	return [ results.sort((a, b) => {
		return b.percentage - a.percentage;
	}), nullVotesPercentage ];
}

export function websterResults(parties: Party[], seats: number, treshold: number, nullVotes: number): [ Result[], number ] {
	// If we further calculate the percentages of an empty list of parties, the program crashes
	if (parties.length === 0) {
		return [ [], 0];
	}

	var results: Result[] = [];
	var quotinents = [];
	var [ percentages, nullVotesPercentage ] = getPercentages(parties, nullVotes);
	
	// Generating the results array; setting the coeficient as the number of votes for each party
	for (var i = 0; i < parties.length; i++) {
		results.push({
			name: parties[i].name,
			percentage: percentages[i],
			seats: 0
		});
		quotinents.push(parties[i].votes);
	}

	// Getting the $seats best quotinents; generating new ones after adding seats to their parties
	for (var j = 0; j < seats; j++) {
		var maxQuotinent = 0;
		var currentWinner = -1;
		for (var i = 0; i < parties.length; i++) {
			if (maxQuotinent < quotinents[i] && percentages[i] >= treshold) {
				maxQuotinent = quotinents[i];
				currentWinner = i;
			}
		}
		if (currentWinner > -1) {
			results[currentWinner].seats++;
			quotinents[currentWinner] = parties[currentWinner].votes / (1 + results[currentWinner].seats*2);
		}
	}

	// Sort the results decreasingly by percentage and return them with the null votes percentage
	return [ results.sort((a, b) => {
		return b.percentage - a.percentage;
	}), nullVotesPercentage ];
}

export const votingMethods = {
	"D'hondt": dHontResults,
	"Webster/Sainte-Laguë": websterResults
}