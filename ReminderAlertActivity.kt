package com.remindernotifier

import android.app.Activity
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.media.RingtoneManager
import android.os.Build
import android.os.Bundle
import android.os.VibrationEffect
import android.os.Vibrator
import android.view.Gravity
import android.view.ViewGroup
import android.view.WindowManager
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView

class ReminderAlertActivity : Activity() {

  private var mediaPlayer: MediaPlayer? = null
  private var vibrator: Vibrator? = null

  private var title: String = ""
  private var description: String = ""
  private var soundName: String? = null
  private var loopSound: Boolean = true

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    configureWindow()

    title = intent.getStringExtra(ReminderLauncher.EXTRA_TITLE).orEmpty()
    description =
      intent.getStringExtra(ReminderLauncher.EXTRA_DESCRIPTION).orEmpty()

    soundName =
      intent.getStringExtra(ReminderLauncher.EXTRA_SOUND_NAME)

    loopSound =
      intent.getBooleanExtra(
        ReminderLauncher.EXTRA_LOOP_SOUND,
        true
      )

    setContentView(buildContentView())

    playSound(soundName, loopSound)
    vibrate()
  }

  override fun onDestroy() {
    stopSound()
    stopVibration()
    ReminderLauncher.clearNotification(this)
    super.onDestroy()
  }

  /* ---------------------------------------------------
     🔥 LOCK SCREEN + SCREEN WAKE
  --------------------------------------------------- */

  private fun configureWindow() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
      setShowWhenLocked(true)
      setTurnScreenOn(true)

      window.addFlags(
        WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
      )
    } else {
      @Suppress("DEPRECATION")
      window.addFlags(
        WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
          WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON or
          WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
          WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD
      )
    }
  }

  /* ---------------------------------------------------
     🎨 MODERN UI
  --------------------------------------------------- */

  private fun buildContentView(): LinearLayout {

    val density = resources.displayMetrics.density

    val root = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      gravity = Gravity.CENTER
      setBackgroundColor(Color.parseColor("#050816"))

      layoutParams = LinearLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.MATCH_PARENT
      )

      setPadding(
        (24 * density).toInt(),
        (24 * density).toInt(),
        (24 * density).toInt(),
        (24 * density).toInt()
      )
    }

    val card = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      gravity = Gravity.CENTER_HORIZONTAL

      setPadding(
        (32 * density).toInt(),
        (40 * density).toInt(),
        (32 * density).toInt(),
        (32 * density).toInt()
      )

      background = rounded(
        Color.parseColor("#111827"),
        30f * density
      )

      elevation = 14f
    }

    /* -----------------------
       ⏰ ICON
    ----------------------- */

    val iconView = TextView(this).apply {
      text = "\u23F0"
      textSize = 72f
      gravity = Gravity.CENTER
      includeFontPadding = false
    }

    /* -----------------------
       🔥 TITLE
    ----------------------- */

    val titleView = TextView(this).apply {
      text = if (title.isBlank()) "Reminder" else title

      textSize = 30f
      gravity = Gravity.CENTER

      setTextColor(Color.WHITE)

      typeface = Typeface.DEFAULT_BOLD

      setPadding(0, (18 * density).toInt(), 0, 0)
    }

    /* -----------------------
       📝 DESCRIPTION
    ----------------------- */

    val descriptionView = TextView(this).apply {
      text = description.ifBlank {
        "You have a scheduled reminder."
      }

      textSize = 18f

      gravity = Gravity.CENTER

      setTextColor(Color.parseColor("#CBD5E1"))

      setLineSpacing(6f, 1f)

      setPadding(
        0,
        (22 * density).toInt(),
        0,
        (40 * density).toInt()
      )
    }

    /* -----------------------
       ✅ OK BUTTON
    ----------------------- */

    val okButton = Button(this).apply {

      text = "DISMISS"

      textSize = 17f

      typeface = Typeface.DEFAULT_BOLD

      setTextColor(Color.WHITE)

      background = rounded(
        Color.parseColor("#DC2626"),
        18f * density
      )

      minHeight = (58 * density).toInt()

      stateListAnimator = null

      setPadding(
        (24 * density).toInt(),
        0,
        (24 * density).toInt(),
        0
      )

      setOnClickListener {
        finish()
      }
    }

    /* -----------------------
       ADD VIEWS
    ----------------------- */

    card.addView(
      iconView,
      LinearLayout.LayoutParams(
        ViewGroup.LayoutParams.WRAP_CONTENT,
        ViewGroup.LayoutParams.WRAP_CONTENT
      )
    )

    card.addView(
      titleView,
      LinearLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.WRAP_CONTENT
      )
    )

    card.addView(
      descriptionView,
      LinearLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.WRAP_CONTENT
      )
    )

    card.addView(
      okButton,
      LinearLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.WRAP_CONTENT
      )
    )

    root.addView(
      card,
      LinearLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.WRAP_CONTENT
      )
    )

    return root
  }

  /* ---------------------------------------------------
     🎨 ROUNDED DRAWABLE
  --------------------------------------------------- */

  private fun rounded(
    color: Int,
    radius: Float
  ): GradientDrawable {

    return GradientDrawable().apply {
      shape = GradientDrawable.RECTANGLE
      setColor(color)
      cornerRadius = radius
    }
  }

  /* ---------------------------------------------------
     🔊 SOUND
  --------------------------------------------------- */

  private fun playSound(
    soundName: String?,
    loopSound: Boolean
  ) {

    try {

      val player = MediaPlayer()

      player.setAudioAttributes(
        AudioAttributes.Builder()
          .setUsage(AudioAttributes.USAGE_ALARM)
          .setContentType(
            AudioAttributes.CONTENT_TYPE_SONIFICATION
          )
          .build()
      )

      val rawSoundId = soundName
        ?.takeIf { it.isNotBlank() }
        ?.let {
          resources.getIdentifier(
            it,
            "raw",
            packageName
          )
        } ?: 0

      if (rawSoundId != 0) {

        resources.openRawResourceFd(rawSoundId)?.use { fd ->
          player.setDataSource(
            fd.fileDescriptor,
            fd.startOffset,
            fd.length
          )
        }

      } else {

        val uri =
          RingtoneManager.getDefaultUri(
            RingtoneManager.TYPE_ALARM
          )
            ?: RingtoneManager.getDefaultUri(
              RingtoneManager.TYPE_NOTIFICATION
            )

        player.setDataSource(this, uri)
      }

      player.isLooping = loopSound

      player.prepare()
      player.start()

      mediaPlayer = player

    } catch (_: Throwable) {
      stopSound()
    }
  }

  private fun stopSound() {
    mediaPlayer?.run {
      if (isPlaying) stop()
      release()
    }

    mediaPlayer = null
  }

  /* ---------------------------------------------------
     📳 VIBRATION
  --------------------------------------------------- */

  private fun vibrate() {

    vibrator =
      getSystemService(VIBRATOR_SERVICE) as Vibrator

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {

      vibrator?.vibrate(
        VibrationEffect.createWaveform(
          longArrayOf(0, 700, 350, 700),
          0
        )
      )

    } else {

      @Suppress("DEPRECATION")
      vibrator?.vibrate(
        longArrayOf(0, 700, 350, 700),
        0
      )
    }
  }
  private fun stopVibration() {
    vibrator?.cancel()
    vibrator = null
  }
}