# 📈 성과 지표 & 분석

## North Star Metric
**"주간 활성 테이스터(WAT)"** - 주 3회 이상 맛 기록을 하는 사용자 수

## 상세 KPI 대시보드

### Growth Metrics
```python
growth_metrics = {
    "acquisition": {
        "new_users_daily": {
            "target": 500,
            "current": 423,
            "trend": "+12%",
            "channels": {
                "organic": 0.45,
                "paid": 0.25,
                "referral": 0.20,
                "social": 0.10
            }
        },
        "cac_by_channel": {
            "google_ads": 12.50,
            "facebook": 8.30,
            "influencer": 5.20,
            "referral": 2.10
        }
    },
    
    "activation": {
        "onboarding_funnel": {
            "app_open": 10000,
            "signup_start": 4500,    # 45%
            "signup_complete": 4000,  # 89%
            "first_record": 2800,     # 70%
            "second_record": 1960,    # 70%
            "habit_formed": 980       # 50% (5+ records)
        },
        "time_to_value": {
            "first_record": "3.5 minutes",
            "first_ai_insight": "5.2 minutes",
            "first_share": "2.3 days",
            "first_subscription": "7.8 days"
        }
    },
    
    "retention": {
        "cohort_retention": {
            "d1": 0.68,
            "d7": 0.52,
            "d30": 0.41,
            "d90": 0.35,
            "d180": 0.30
        },
        "resurrection_rate": 0.15,
        "churn_reasons": {
            "too_complex": 0.25,
            "not_enough_value": 0.20,
            "technical_issues": 0.15,
            "price": 0.10,
            "other": 0.30
        }
    },
    
    "revenue": {
        "mrr": 52000,
        "arr": 624000,
        "arpu": 5.20,
        "conversion_funnel": {
            "free_users": 10000,
            "trial_started": 2000,     # 20%
            "trial_to_paid": 800,      # 40%
            "paid_retention_m1": 720,  # 90%
            "paid_retention_m6": 576   # 72%
        },
        "ltv_by_tier": {
            "lab_pro_only": 65,
            "subscription_a": 180,    # 이달의 추천
            "subscription_b": 165,    # 내가 고르기
            "subscription_c": 210     # 블라인드 박스
        }
    },
    
    "engagement": {
        "dau_mau": 0.45,
        "records_per_user_weekly": 4.7,
        "feature_adoption": {
            "ocr": 0.73,
            "ai_feedback": 0.85,
            "social_share": 0.32,
            "lab_mode": 0.15,
            "blind_test": 0.08,
            "qr_scan": 0.62          # 원두 구독 QR
        },
        "session_metrics": {
            "avg_duration": "8:32",
            "screens_per_session": 12.3,
            "actions_per_session": 28.7
        }
    },
    
    "subscription_metrics": {
        "total_subscribers": 1000,
        "distribution": {
            "이달의_추천": 500,      # 50%
            "내가_고르기": 350,      # 35%
            "블라인드_박스": 150     # 15%
        },
        "subscription_retention": {
            "m1": 0.92,
            "m3": 0.85,
            "m6": 0.78,
            "m12": 0.65
        },
        "lab_pro_activation": {
            "구독자_활성화율": 0.72,
            "주간_lab_사용횟수": 3.2,
            "월간_분석_리포트_열람": 0.89
        },
        "bundle_effectiveness": {
            "구독_전환율_향상": "+35%",
            "ltv_증가": "+120%",
            "이탈률_감소": "-40%"
        },
        "inventory_metrics": {
            "평균_재고_회전": "주 2.5회",
            "폐기율": "2.1%",
            "품절률": "3.5%"
        }
    }
}
```

## 실시간 모니터링 대시보드

```yaml
monitoring_dashboard:
  business_metrics:
    - widget: "Real-time Revenue"
      metrics: ["MRR", "Daily Revenue", "Conversion Rate", "Subscription Revenue"]
      refresh: "1 minute"
      
    - widget: "User Activity Heatmap"
      metrics: ["Active Users by Hour", "Records by Region", "Subscription Orders"]
      visualization: "heatmap"
      
    - widget: "Feature Performance"
      metrics: ["API Latency", "Error Rate", "Feature Usage", "QR Scan Rate"]
      alerts:
        - latency > 500ms
        - error_rate > 1%
        
    - widget: "Subscription Dashboard"
      metrics: ["New Subscribers", "Churn Rate", "Inventory Status", "Delivery Status"]
      visualization: "multi-chart"
  
  technical_metrics:
    - widget: "System Health"
      metrics: ["CPU", "Memory", "Disk I/O", "Network"]
      
    - widget: "ML Model Performance"
      metrics: ["Prediction Accuracy", "Inference Time", "Model Drift"]
      
    - widget: "Database Performance"
      metrics: ["Query Time", "Connection Pool", "Replication Lag"]
  
  alerts:
    critical:
      - "Payment failure rate > 5%"
      - "AI service down > 1 minute"
      - "Database replication lag > 10s"
      - "Subscription fulfillment failure > 2%"
    
    warning:
      - "Conversion rate drop > 20%"
      - "Support ticket spike > 50%"
      - "Memory usage > 80%"
      - "Coffee inventory < 3 days supply"
      - "Lab Pro activation < 60%"
```

## 구독 서비스 상세 지표

```python
subscription_analytics = {
    "acquisition": {
        "구독_퍼널": {
            "랜딩_페이지_방문": 10000,
            "구독_상세_조회": 3500,      # 35%
            "구독_시작": 1000,           # 28.6%
            "첫_결제_완료": 920          # 92%
        },
        "구독_유입_채널": {
            "lab_mode_업셀": 0.35,
            "커뮤니티_추천": 0.25,
            "인플루언서": 0.20,
            "직접_검색": 0.20
        }
    },
    
    "engagement": {
        "구독자_활동": {
            "주간_기록_횟수": 6.8,       # 일반 사용자 4.7
            "lab_mode_사용률": 0.72,     # 일반 사용자 0.15
            "커뮤니티_참여율": 0.45,     # 일반 사용자 0.22
            "블라인드_챌린지_참여": 0.38
        },
        "만족도": {
            "nps_score": 72,
            "재구매_의향": 0.89,
            "추천_의향": 0.83
        }
    },
    
    "economics": {
        "unit_economics": {
            "평균_객단가": 42.50,
            "원두_원가": 18.00,
            "포장_배송비": 5.50,
            "lab_pro_비용": 2.00,        # 기회비용
            "마진": 17.00                # 40%
        },
        "ltv_분석": {
            "3개월_ltv": 127.50,
            "6개월_ltv": 234.00,
            "12개월_ltv": 390.00,
            "평균_구독_기간": "8.2개월"
        }
    }
}
```