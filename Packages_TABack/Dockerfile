FROM eclipse-temurin:21
ARG JAR_FILE=target/TravelAgency_Back.jar
COPY ${JAR_FILE} TravelAgency_Back.jar
ENTRYPOINT ["java", "-jar", "/TravelAgency_Back.jar"]