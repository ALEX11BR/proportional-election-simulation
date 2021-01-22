import type Party from './Party';

export interface Result {
	name: string,
	percentage: number,
	seats: number
}

function getVoters(parties: Party[], nullVotes: number) {
	var voters = nullVotes;
	for (const party of parties) {
		voters += party.votes;
	}

	return [ nullVotes*100/voters, voters ];
}

function highestAveragesCalculator(parties: Party[], seats: number, treshold: number, nullVotes: number, quotinentFn: (votes: number, seats: number) => number): [ Result[], number ] {
	if (parties.length === 0) {
		return [ [], 0];
	}

	var results: Result[] = [];
	var quotinents: number[] = [];
	var [ nullVotesPercentage, voters ] = getVoters(parties, nullVotes);
	
	// Generating the results array; setting the coeficient as the number of votes for each party
	for (var i = 0; i < parties.length; i++) {
		results.push({
			name: parties[i].name,
			percentage: parties[i].votes*100/voters,
			seats: 0
		});
		quotinents.push(quotinentFn(parties[i].votes, 0));
	}

	// Getting the $seats best quotinents; generating new ones after adding seats to their parties
	for (var j = 0; j < seats; j++) {
		var maxQuotinent = 0;
		var currentWinner = -1;
		for (var i = 0; i < parties.length; i++) {
			if (maxQuotinent < quotinents[i] && results[i].percentage >= treshold) {
				maxQuotinent = quotinents[i];
				currentWinner = i;
			}
		}
		// If no party passes the treshold, the current winner stays -1, and no one will get a seat
		if (currentWinner > -1) {
			results[currentWinner].seats++;
			quotinents[currentWinner] = quotinentFn(parties[currentWinner].votes, results[currentWinner].seats);
		}
	}

	// Sort the results decreasingly by percentage and return them with the null votes percentage
	return [ results.sort((a, b) => {
		return b.percentage - a.percentage;
	}), nullVotesPercentage ];
}
export function dHontResults(parties: Party[], seats: number, treshold: number, nullVotes: number): [ Result[], number ] {
	return highestAveragesCalculator(parties, seats, treshold, nullVotes, (votes: number, seats: number) => votes / (seats + 1));
}

export function websterResults(parties: Party[], seats: number, treshold: number, nullVotes: number): [ Result[], number ] {
	return highestAveragesCalculator(parties, seats, treshold, nullVotes, (votes: number, seats: number) => votes / (2*seats + 1));
}

export const votingMethods = {
	"D'hondt": dHontResults,
	"Webster/Sainte-Laguë": websterResults
}