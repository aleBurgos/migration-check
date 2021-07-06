import { Client } from "@elastic/elasticsearch";
import { ELASTIC_SEARCH} from './config'

const client = new Client({
	node: ELASTIC_SEARCH,
});

 const getESTotalsByCommunity = async (index, filterPipeline = []) => {
	const body = {
		size: 0,
		query: {
			bool: {
				must: filterPipeline
			}
		},
		aggs: {
			total: {
				value_count: {
					field: "communityId.keyword",
				},
			},
			byCommunity: {
				terms: {
					field: "communityId.keyword",
					size: 100000,
				},
			},
		},
	};
	const result = (await client.search({
		index,
		body,
	})).body.aggregations;

	const total = result.total.value;
	const buckets = result.byCommunity.buckets;
	const byCommunity = buckets.reduce((acc, { key, doc_count }) => {
		acc[key] = doc_count;
		return acc;
	}, {});

	return { byCommunity, total};
};

export default ({name: clusterName})=>{

	const leads = async ()=>{
		return await getESTotalsByCommunity(`${clusterName}-system-events`,[{
			"match": {
			  "type": "REQUEST_INFO"
			}
		  }])
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
		return await getESTotalsByCommunity(`${clusterName}-users`)
	}

	 const meetings = async ()=>{
		return await getESTotalsByCommunity(`${clusterName}-meetings`)
	}

	 const messages = async ()=>{
		return await getESTotalsByCommunity(`${clusterName}-messages`)
	}

	const syncedCommunityIds = async ()=>{
		const totals = await getESTotalsByCommunity(`${clusterName}-users`);
		return Object.keys(totals.byCommunity);
	}
	return { meetings, messages,leads,videoWatched,fileDownloaded, users, bannerClicks, syncedCommunityIds };
}


