
import { MongoClient } from "mongodb";

export default async ({url})=>{

	const client = await MongoClient.connect(url);
	const db = await client.db("pathable");

	const getMongoTotalsByCommunity = async (collectionName, pipelineAggregation = [])=>{

		const collection = await db.collection(collectionName);
		const results =  await collection.aggregate([...pipelineAggregation, {$sortByCount:'$communityId'}]).toArray();
		let total = 0;
		const byCommunity = results.reduce((acc, {_id, count})=>{
			acc[_id] = count;
			total += count;
			return acc;
		},{});

		return {total, byCommunity};
	}


	const leads = async ()=>{
		return await getMongoTotalsByCommunity('leads',   [{
			$unwind: '$interactions'
		},
		{
			$match: {
				'interactions.type':'REQUEST',
			}
		}]
		)
	};

	 const bannerClicks = async ()=>{
		return await getESTotalsByCommunity(`${clusterName}-system-events`,[{
			"match": {
			  "type": "BANNER_AD_CLICK"
			}
		  }])
	};

	 const fileDownloaded = async ()=>{
		return await getESTotalsByCommunity(`${clusterName}-system-events`,[{
			"match": {
			  "type": "FILE_DOWNLOADED"
			}
		  }])
	};

	 const videoWatched = async ()=>{
		return await getESTotalsByCommunity(`${clusterName}-system-events`,[{
			"match": {
			  "type": "VIDEO_WATCHED"
			}
		  }])
	};

	 const users = async ()=>{
		return await getMongoTotalsByCommunity('people-profiles')
	}

	 const meetings = async ()=>{
		return await getMongoTotalsByCommunity(`meetings`)
	}

	 const messages = async ()=>{
		return await getMongoTotalsByCommunity(`messages`)
	}

	const migratedCommunityIds = async ()=>{
		return (
			await (await db.collection('diagnostic-jobs')).aggregate([
				{
					$match: {
						name: "migrate-metrics-to-stats"
					},
				},
				{ $project: { communityId: 1 } },
			]).toArray()
		).map(({ communityId }) => communityId);
	};

	const allCommunitiesIds = async ()=>{
		return (
			await (await db.collection('communities')).aggregate([
				{
					$match: {
						type: "EVENT",
						disabledAt: { $exists: false },
						removedAt: { $exists: false },
					},
				},
				{ $project: { communityId: 1 } },
			]).toArray()
		).map(({ _id }) => _id);
	};
	return { meetings, messages,leads,videoWatched,fileDownloaded, users, bannerClicks, migratedCommunityIds, allCommunitiesIds };
}


