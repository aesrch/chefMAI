package com.example

import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import com.example.model.HealthResponse
import com.example.routes.*
import com.example.routes.detectionRoutes
import com.example.client.YoloClient
import com.example.service.YoloService

// Recommendation engine imports
import com.example.repository.*
import com.example.service.*

fun Application.configureRouting() {
    val yoloClient = YoloClient() 
    val yoloService = YoloService(yoloClient)

    // ── Recommendation Engine Dependency Wiring ──────────────────────
    val rcpRepository = RcpRepository()
    val substitutionRepo = SubstitutionRepository()
    val nbModelRepo = NbModelRepository()
    val userPrefRepo = UserPreferenceRepository()
    val recLogRepo = RecommendationLogRepository()

    val substitutionService = SubstitutionService(substitutionRepo)
    val matchScoringService = MatchScoringService()
    val naiveBayesService = NaiveBayesService(nbModelRepo, rcpRepository)
    val bayesianPrefService = BayesianPreferenceService(userPrefRepo)
    val metricsService = MetricsService(recLogRepo)

    val recommendationEngine = RecommendationEngine(
        rcpRepo = rcpRepository,
        matchService = matchScoringService,
        nbService = naiveBayesService,
        prefService = bayesianPrefService,
        subService = substitutionService,
        logRepo = recLogRepo
    )

    val accRepository = AccRepository()

    val evaluationService = EvaluationService(
        recommendationEngine = recommendationEngine,
        metricsService = metricsService,
        accRepo = accRepository,
        logRepo = recLogRepo,
        prefRepo = userPrefRepo
    )

    // Auto-train Naive Bayes model on startup
    try {
        naiveBayesService.autoTrain()
        log.info("Naive Bayes model auto-trained successfully")
    } catch (e: Exception) {
        log.warn("Naive Bayes auto-train failed (will work without it): ${e.message}")
    }

    routing {
        get("/") {
            call.respondText("Hello World!")
        }

        get("/health") {
            call.respond(
                HealthResponse(
                    status = "OK",
                    service = "ktor-backend"
                )
            )
        }

        //login signup routes
        authRoutes()
        route("/users") {
            post { 
                // user registration
            }
            get("/{id}") { 
                // get user by id
            }
        }

        route("/recipes") {
            recipeRoutes()
        }

        route("/filter") {
            filterRoutes()
        }

        ratingRoutes(bayesianPrefService, rcpRepository)

        //images
        imageRoutes()


        //detection — now wired to recommendation engine for Priority 7
        detectionRoutes(yoloService, recommendationEngine)

        // ── Recommendation Engine Routes ────────────────────────────
        substitutionRoutes(substitutionService)
        recommendationRoutes(recommendationEngine, recLogRepo)
        nbRoutes(naiveBayesService)
        preferenceRoutes(bayesianPrefService)
        metricsRoutes(metricsService)
        evaluationRoutes(evaluationService)

    }
}