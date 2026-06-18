FROM eclipse-temurin:21
ARG JAR_FILE=target/Api_Gateway.jar
COPY ${JAR_FILE} Api_Gateway.jar
ENTRYPOINT ["java", "-jar", "/Api_Gateway.jar"]