<script lang="ts">
	import { Container, Row, Col, Input, Navbar, NavbarBrand, Table, ListGroup, ListGroupItem } from 'sveltestrap';
	import ShowParty from './ShowParty.svelte';
	import { dHontResults } from './GetResults';
	import type Party from './Party';

	export let parties: Party[];
	export let seats: number;
	export let treshold: number;
	export let nullVotes: number;

	$: results = parties.length ? dHontResults(parties, seats, treshold, nullVotes) : []; 

	function addParty() {
		parties = [ ...parties, {
			name: `New Party #${parties.length + 1}`,
			votes: 1
		}];
	}
	function deleteParty(index: number) {
		parties = [
			...parties.slice(0, index),
			...parties.slice(index+1)
		];
	}
</script>

<Navbar color="dark" dark>
	<NavbarBrand>Proportional election simulation</NavbarBrand>
</Navbar>
<br />
<Container fluid>
	<Row>
		<Col xs={12} lg={6}>
			<h3>Parties</h3>
			<ListGroup>
				{#each parties as party, i}
					<ListGroupItem>
						<ShowParty bind:party={party} onDelete={() => deleteParty(i)} />
					</ListGroupItem>
				{/each}
				<ListGroupItem active tag="button" on:click={addParty}>Add party</ListGroupItem>
			</ListGroup>
			<br />
			<Row>
				<Col xs=6>
					<h6>Number of seats</h6>
					<Input type="number" bind:value={seats} />
				</Col>
				<Col xs=6>
					<h6>Treshold (%)</h6>
					<Input type="number" bind:value={treshold} />
				</Col>
			</Row>
			<br />
			<Row>
				<Col xs=6>
					<h6>Null votes</h6>
					<Input type="number" bind:value={nullVotes} />
				</Col>
				<Col xs=6>
					<h6>Distribution method</h6>
					<Input type="select">
						<option>D'hondt</option>
					</Input>
				</Col>
			</Row>
			<br />
		</Col>
		<Col xs={12} lg={6}>
			<h3>Results</h3>
			{#if results.length}
				<Table bordered>
					<thead class="thead-light">
						<tr>
							<th>Party Name</th>
							<th>Share of the vote</th>
							<th>Seats</th>
						</tr>
					</thead>
					<tbody>
						{#each results as result}
							<tr>
								<th>{result.name}</th>
								<th>{(result.percentage).toFixed(2)}%</th>
								<th>{result.seats}</th>
							</tr>
						{/each}
					</tbody>
				</Table>
			{:else}
				<p>No parties, no results!</p>
			{/if}
		</Col>
	</Row>
</Container>