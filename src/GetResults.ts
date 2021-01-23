import type Party from './Party';

export interface Result {
	name: string,
	percentage: number,
	seats: number
}

interface Remainder {
	id: number,
	remainder: number
}

function getVoters(parties: Party[], nullVotes: number) {
	var voters = nullVotes;
	for (const party of parties) {
		voters += party.votes;
	}

	return [ nullVotes*100/voters, voters ];
}

function highestAveragesCalculator(parties: Party[], seats: number, treshold: number, nullVotes: number, quotinentFn: (votes: number, seats: number) => number): [ Result[], number ] {
	// For an empty parties array, return early an empty result array, that the Svelte view handles nicely, and save the function body from some unexpected consequences
	if (parties.length === 0) {
		return [ [], 0];
	}

	var results: Result[] = [];
	var quotinents: number[] = [];
	var [ nullVotesPercentage, voters ] = getVoters(parties, nullVotes);
	
	// Generating the results array; setting the quotinent as the number of votes for each party
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

function largestRemainderCalculator(parties: Party[], seats: number, treshold: number, nullVotes: number, quotaFn: (votes: number, seats: number) => number): [ Result[], number ] {
	// For an empty parties array, return early an empty result array, that the Svelte view handles nicely, and save the function body from some unexpected consequences
	if (parties.length === 0) {
		return [ [], 0];
	}

	var occupiedSeats = 0;
	var results: Result[] = [];
	var [ nullVotesPercentage, voters ] = getVoters(parties, nullVotes);
	var remainders: Remainder[] = [];

	const quota = quotaFn(voters - nullVotes, seats);

	// Generating the results & remainders (only for parties over the treshold) arrays
	for (var i = 0; i < parties.length; i++) {
		const percentage = parties[i].votes*100/voters;
		const partySeats = percentage >= treshold ? parties[i].votes/quota : 0;
		
		if (percentage >= treshold) {
			remainders.push({
				id: i,
				remainder: partySeats % 1
			});
		}

		results.push({
			name: parties[i].name,
			percentage,
			seats: Math.floor(partySeats)
		});
		occupiedSeats += Math.floor(partySeats);
	}
	
	// After a bubble sort iteration, the largest item of the array will be at the beginning of the array (in this implementation). Rinse and repeat
	// After ${seats - occupiedSeats} iterations, the ${seats - occupiedSeats} best remainders will be in the first ${seats - occupiedSeats} positions of the array
	for (var j = seats; j > occupiedSeats; j--) {
		for (var i = remainders.length - 1; i > 0; i--) {
			if (remainders[i].remainder > remainders[i-1].remainder) {
				const tmp = remainders[i];
				remainders[i] = remainders[i-1];
				remainders[i-1] = tmp;
			}
		}
	}
	// Now let's add the best remainder's seats to their results
	// As there might be an edge case of more free seats than valid remainders (candidates), we take care of that with the Math.min instruction
	for (var i = 0; i < Math.min(seats-occupiedSeats, remainders.length); i++) {
		results[ remainders[i].id ].seats ++;
	}
	
	// Sort the results decreasingly by percentage and return them with the null votes percentage
	return [ results.sort((a, b) => {
		return b.percentage - a.percentage;
	}), nullVotesPercentage ];
}
export function largestRemainderHareResults(parties: Party[], seats: number, treshold: number, nullVotes: number): [ Result[], number ] {
	return largestRemainderCalculator(parties, seats, treshold, nullVotes, (votes: number, seats: number) => votes/seats);
}
export function largestRemainderDroopResults(parties: Party[], seats: number, treshold: number, nullVotes: number): [ Result[], number ] {
	return largestRemainderCalculator(parties, seats, treshold, nullVotes, (votes: number, seats: number) => Math.floor(1 + (votes / (seats+1))));
}

export const votingMethods = {
	"D'hondt": dHontResults,
	"Webster/Sainte-Laguë": websterResults,
	"Largest remainder (Hare quota)": largestRemainderHareResults,
	"Largest remainder (Droop quota)": largestRemainderDroopResults
}