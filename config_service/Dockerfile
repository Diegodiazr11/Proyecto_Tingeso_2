FROM eclipse-temurin:21
ARG JAR_FILE=target/Config_Service.jar
COPY ${JAR_FILE} Config_Service.jar
ENTRYPOINT ["java", "-jar", "/Config_Service.jar"]