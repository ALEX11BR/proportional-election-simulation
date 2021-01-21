<script lang="ts">
	import { Row, Col, Button, Input, Icon } from 'sveltestrap';
	import type Party from './Party';

	export let party: Party;
	export let onDelete: () => void;
</script>

<Row>
	<Col xs="auto">
		<Button color="danger" on:click={onDelete}><Icon name="trash" /></Button>
	</Col>
	<Col>
		<h6>Name of the party:</h6>
		<Input type="text" bind:value={party.name} />
	</Col>
	<Col>
		<h6>Number of votes:</h6>
		<Input type="number" bind:value={party.votes} />
	</Col>
</Row>