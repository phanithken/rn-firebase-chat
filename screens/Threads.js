import React, {useState, useEffect} from "react";
import {FlatList, View} from "react-native";

import {ThreadRow, Separator} from "../components/ThreadRow";
import {listenToThreads, listenToThreadTracking} from "../firebase";

const isThreadUnread = (thread, threadTracking) => {
    console.log(threadTracking)
    console.log(thread)
    if (threadTracking && thread) {
        return threadTracking[thread._id] && threadTracking[thread._id] < thread.latestMessage.createdAt;
    }
    return false
}

export default ({navigation}) => {
    const [threads, setThreads] = useState([]);
    const [threadTracking, setThreadTracking] = useState({});

    useEffect(() => {
        const unsubscribe = listenToThreads().onSnapshot(querySnapshot => {
            if (querySnapshot) {
                const allThreads = querySnapshot.docs.map(snapshot => {
                    return {
                        _id: snapshot.id,
                        name: '',
                        latestMessage: {text: ''},
                        ...snapshot.data()
                    }
                })

                setThreads(allThreads)
            }
        })

        return () => {
            unsubscribe()
        }
    }, [])

    useEffect(() => {
        const unsubscribe = listenToThreadTracking().onSnapshot(snapshot => {
            if (snapshot) {
                setThreadTracking(snapshot.data())
            } else {
                setThreadTracking({})
            }
        })

        return () => {
            unsubscribe()
        }
    }, [])

    return (
        <View style={{flex: 1, backgroundColor: '#fff', paddingBottom: 50}}>
            <FlatList data={threads}
                      keyExtractor={item => item._id}
                      renderItem={({item}) => (
                          <ThreadRow {...item}
                                     onPress={() => navigation.navigate('Messages', {thread: item})}
                                     unread={isThreadUnread(item, threadTracking)} />
                      )} />
        </View>
    );
}
