import { INDEXES_VALUES } from "./constants";

export const loadDB = async ({url}) => {
	const client = await MongoClient.connect(url);
	const db = await client.db("pathable");
	const SystemEvents = await db.collection("system-events");
	const Leads = await db.collection("leads");
	const PeopleProfiles = await db.collection("people-profiles");
	const DiagnosticJobs = await db.collection("diagnostic-jobs");
	const Communities = await db.collection("communities");

	return { SystemEvents, Leads, PeopleProfiles, DiagnosticJobs, Communities };
};



const getMigratedComunitiesIds = async (db)=>{
	return (
		await (await db.collection('diagnostic-jobs')).aggregate([
			{
				$match: {
					name: "migrate-metrics-to-stats",
					status: "completed",
				},
			},
			{ $project: { _id: 1 } },
		]).toArray()
	).map(({ _id }) => _id);
};


