#base image: linux alpine os with open jdk 8
FROM openjdk:17-jdk-alpine

# copy jar from local into docker image
COPY target/demo-0.0.1-SNAPSHOT.jar demo-0.0.1-SNAPSHOT.jar

#command line to run ja
ENTRYPOINT ["java", "-jar", "demo-0.0.1-SNAPSHOT.jar"]