update public.office_activity_events
set
  description = case event_type
    when 'check_in' then '오늘 업무를 시작했습니다.'
    when 'status_changed' then case coalesce(meta->>'statusType', '')
      when 'study_algorithm' then '알고리즘 공부 상태로 전환했습니다.'
      when 'portfolio' then '포트폴리오 작업 상태로 전환했습니다.'
      when 'resume' then '이력서 작업 상태로 전환했습니다.'
      when 'break' then '휴식 상태로 전환했습니다.'
      when 'meal' then '식사 상태로 전환했습니다.'
      when 'away' then '자리 비움 상태로 전환했습니다.'
      else '현재 상태를 전환했습니다.'
    end
    when 'focus_session_started' then '집중 세션을 시작했습니다.'
    when 'focus_session_completed' then '집중 세션을 완료했습니다.'
    when 'focus_session_interrupted' then '집중 세션을 중단했습니다.'
    when 'check_out' then case
      when coalesce((meta->>'goalCompleted')::boolean, false) then '오늘 회고를 저장하고 목표 달성으로 퇴근했습니다.'
      else '오늘 회고를 저장하고 퇴근했습니다.'
    end
    when 'task_created' then '새 작업을 등록했습니다.'
    when 'task_started' then '작업 하나를 진행 중으로 전환했습니다.'
    when 'task_completed' then '작업 하나를 완료했습니다.'
    when 'task_reopened' then '작업 하나를 다시 열었습니다.'
    else description
  end,
  meta = case event_type
    when 'check_in' then case
      when jsonb_typeof(meta->'lateMinutes') = 'number' then jsonb_build_object('lateMinutes', meta->'lateMinutes')
      else '{}'::jsonb
    end
    when 'status_changed' then case
      when jsonb_typeof(meta->'statusType') = 'string' then jsonb_build_object('statusType', meta->'statusType')
      else '{}'::jsonb
    end
    when 'focus_session_started' then case
      when jsonb_typeof(meta->'durationMinutes') = 'number' then jsonb_build_object('durationMinutes', meta->'durationMinutes')
      else '{}'::jsonb
    end
    when 'focus_session_completed' then
      (case
        when jsonb_typeof(meta->'durationMinutes') = 'number' then jsonb_build_object('durationMinutes', meta->'durationMinutes')
        else '{}'::jsonb
      end) ||
      (case
        when jsonb_typeof(meta->'isCompleted') = 'boolean' then jsonb_build_object('isCompleted', meta->'isCompleted')
        else '{}'::jsonb
      end)
    when 'focus_session_interrupted' then
      (case
        when jsonb_typeof(meta->'durationMinutes') = 'number' then jsonb_build_object('durationMinutes', meta->'durationMinutes')
        else '{}'::jsonb
      end) ||
      (case
        when jsonb_typeof(meta->'isCompleted') = 'boolean' then jsonb_build_object('isCompleted', meta->'isCompleted')
        else '{}'::jsonb
      end)
    when 'check_out' then case
      when jsonb_typeof(meta->'goalCompleted') = 'boolean' then jsonb_build_object('goalCompleted', meta->'goalCompleted')
      else '{}'::jsonb
    end
    else '{}'::jsonb
  end
where office_slug = 'soloshift-commons';
