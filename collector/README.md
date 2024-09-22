
```sh
kafka-topics --create --topic logx-ingesting-kafka-topic --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
kafka-topics --list --bootstrap-server localhost:9092
```