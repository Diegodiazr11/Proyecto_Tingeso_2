FROM eclipse-temurin:21
ARG JAR_FILE=target/Eureka_Service.jar
COPY ${JAR_FILE} Eureka_Service.jar
ENTRYPOINT ["java", "-jar", "/Eureka_Service.jar"]